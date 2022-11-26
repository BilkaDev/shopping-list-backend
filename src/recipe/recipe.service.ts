import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Recipe } from "./recipe.entity";
import { CreateRecipeDto } from "./dto/create-recipe";
import { AddItemToRecipe, CreateRecipeResponse, DeleteRecipeResponse, EditNameRecipeResponse, GetRecipesResponse } from "../interfaces";
import { ListService } from "src/list/list.service";
import { AddItemToRecipeDto } from "./dto/add-item-to-recipe";
import { UserService } from "../user/user.service";
import { EditRecipeDto } from "./dto/edit-name-recipe";
import { EditDescriptionRecipeDto } from "./dto/edit-description-recipe";
import { ILike } from "typeorm";

@Injectable()
export class RecipeService {
  constructor(@Inject(forwardRef(() => ListService)) private listService: ListService, @Inject(forwardRef(() => UserService)) private userService: UserService) {}

  async createRecipe(recipe: CreateRecipeDto): Promise<CreateRecipeResponse> {
    const user = await this.userService.getOneUser(recipe.userId);
    if (!user) return { isSuccess: false };
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
      return {
        isSuccess: true,
        id: newRecipe.id,
      };
    } else return { isSuccess: false };
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
    return (
      await Recipe.find({
        where: { user: { id: userId } },
      })
    ).map(recipe => ({
      name: recipe.name,
      id: recipe.id,
    }));
  }

  async getOneRecipe(recipeId: string, userId: string) {
    const recipe = await Recipe.findOne({
      where: { id: recipeId, user: { id: userId } },
      relations: ["items"],
    });
    if (recipe === null) {
      throw new BadRequestException("Cannot find recipe.");
    }
    return recipe;
  }

  async addItemToRecipe(item: AddItemToRecipeDto, userId: string): Promise<AddItemToRecipe> {
    const recipe = await this.getOneRecipe(item.recipeId, userId);
    if (recipe) {
      const createItem = await this.listService.createItem({
        itemId: item.itemId,
        count: item.count,
        weight: item.weight,
      });
      recipe.items.push(createItem);
      await recipe.save();
      return {
        id: createItem.id,
        isSuccess: true,
      };
    } else return { isSuccess: false };
  }

  async editNamedRecipe({ id, name }: EditRecipeDto, userId: string): Promise<EditNameRecipeResponse> {
    const recipe = await this.getOneRecipe(id, userId);
    if (recipe) {
      recipe.name = name;
      await recipe.save();
      return { isSuccess: true };
    } else return { isSuccess: false };
  }

  async deleteRecipe(recipeId: string, userId: string): Promise<DeleteRecipeResponse> {
    const recipe = await this.getOneRecipe(recipeId, userId);
    if (recipe) {
      await recipe.remove();
      return { isSuccess: true };
    } else return { isSuccess: false };
  }

  editDescriptionRecipe = async ({ description, id }: EditDescriptionRecipeDto, userId: string) => {
    const recipe = await this.getOneRecipe(id, userId);
    if (recipe) {
      recipe.description = description;
      await recipe.save();
      return { isSuccess: true };
    } else return { isSuccess: false };
  };
}
