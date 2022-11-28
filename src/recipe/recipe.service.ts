import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Recipe } from "./recipe.entity";
import { CreateRecipeDto } from "./dto/create-recipe";
import {
  AddItemToRecipe,
  CreateRecipeResponse,
  DeleteRecipeResponse,
  EditDescriptionRecipeResponse,
  EditNameRecipeResponse,
  GetRecipeResponse,
  GetRecipesResponse,
  RecipeFilter,
} from "../interfaces";
import { ListService } from "src/list/list.service";
import { AddItemToRecipeDto } from "./dto/add-item-to-recipe";
import { EditRecipeDto } from "./dto/edit-name-recipe";
import { EditDescriptionRecipeDto } from "./dto/edit-description-recipe";
import { ILike } from "typeorm";
import { User } from "../user/user.entity";

@Injectable()
export class RecipeService {
  constructor(@Inject(forwardRef(() => ListService)) private listService: ListService) {}

  filter = (recipes: Recipe[]): RecipeFilter[] =>
    recipes.map(recipe => ({
      name: recipe.name,
      id: recipe.id,
    }));
  async createRecipe(recipe: CreateRecipeDto, user: User): Promise<CreateRecipeResponse> {
    const checkName = await this.hasRecipe(recipe.userId, recipe.name);
    if (!checkName) {
      const newRecipe = new Recipe();
      newRecipe.items = [];
      for (const item of recipe.items) {
        const createItem = await this.listService.createItem({
          itemId: item.itemId,
          count: item.count,
          weight: item.weight,
        });
        newRecipe.items.push(createItem);
      }
      newRecipe.description = recipe.description;
      newRecipe.name = recipe.name;
      newRecipe.user = user;
      await newRecipe.save();
      return { id: newRecipe.id };
    } else throw new BadRequestException("The given recipe name is taken");
  }

  async hasRecipe(userId: string, name: string) {
    const recipe = await Recipe.find({
      where: {
        name: ILike(name),
        user: { id: userId },
      },
    });
    return recipe.length > 0;
  }

  async getUserRecipes(userId: string): Promise<GetRecipesResponse> {
    const recipes = this.filter(
      await Recipe.find({
        where: { user: { id: userId } },
      }),
    );
    return { recipes };
  }

  async getOneRecipe(recipeId: string, userId: string): Promise<Recipe> {
    const recipe = await Recipe.findOne({
      where: { id: recipeId, user: { id: userId } },
      relations: ["items"],
    });
    if (recipe === null) {
      throw new NotFoundException("Cannot find recipe.");
    }
    return recipe;
  }

  async getOneRecipeResponse(recipeId: string, userId: string): Promise<GetRecipeResponse> {
    const recipe = await this.getOneRecipe(recipeId, userId);
    return { recipe };
  }

  async addItemToRecipe(item: AddItemToRecipeDto, userId: string): Promise<AddItemToRecipe> {
    const recipe = await this.getOneRecipe(item.recipeId, userId);
    const createItem = await this.listService.createItem({
      itemId: item.itemId,
      count: item.count,
      weight: item.weight,
    });
    recipe.items.push(createItem);
    await recipe.save();
    return { id: createItem.id };
  }

  async editNamedRecipe({ id, name }: EditRecipeDto, userId: string): Promise<EditNameRecipeResponse> {
    const recipe = await this.getOneRecipe(id, userId);
    const checkName = await this.hasRecipe(userId, name);
    if (!checkName) {
      recipe.name = name;
      await recipe.save();
      return { message: "Recipe has been updated!" };
    } else throw new BadRequestException("The given name is already taken.");
  }

  async deleteRecipe(recipeId: string, userId: string): Promise<DeleteRecipeResponse> {
    const recipe = await this.getOneRecipe(recipeId, userId);
    if (recipe) {
      await recipe.remove();
      return { message: "Recipe has been remove!" };
    } else throw new NotFoundException("Recipe does not exist.");
  }

  editDescriptionRecipe = async ({ description, id }: EditDescriptionRecipeDto, userId: string): Promise<EditDescriptionRecipeResponse> => {
    const recipe = await this.getOneRecipe(id, userId);
    if (recipe) {
      recipe.description = description;
      await recipe.save();
      return { message: "Recipe has been update!" };
    } else throw new NotFoundException("Recipe does not exist.");
  };
}
