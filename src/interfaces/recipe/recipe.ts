import { ItemInListInterface } from "../list";
import { CreateRecipeDto } from "../../recipe/dto/create-recipe";
import { EditRecipeDto } from "../../recipe/dto/edit-name-recipe";
import { EditDescriptionRecipeDto } from "../../recipe/dto/edit-description-recipe";

export interface RecipeInterface {
  id: string;
  name: string;
  description: string;
  items: ItemInListInterface[];
}

export type RecipeFilter = Omit<RecipeInterface, "description" | "items">;

export type CreateRecipeResponse = { id: string };

export type EditNameRecipeResponse = { message: string };

export type AddRecipeRequest = CreateRecipeDto;
export type EditRecipeRequest = EditRecipeDto;
export type EditDescriptionRecipeRequest = EditDescriptionRecipeDto;

export type AddItemToRecipe = CreateRecipeResponse;
export type DeleteRecipeResponse = EditNameRecipeResponse;
export type EditDescriptionRecipeResponse = EditNameRecipeResponse;
export type GetRecipesResponse = {
  recipes: RecipeFilter[];
};
export type GetRecipeResponse = {
  recipe: RecipeInterface;
};
