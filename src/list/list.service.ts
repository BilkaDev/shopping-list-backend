import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {List} from "./list.entity";
import {CreateListDto} from "./dto/create-list";
import {AddRecipeToListResponse, CreateListResponse, DeleteListResponse, EditListResponse} from "../interfaces/list/list";
import {CreateItemInListDto} from "./dto/create-item-in-list";
import {AddItemtoListResponse, UpdateItemInListResponse} from "../interfaces/list/item-in-list";
import {ProductService} from "../product/product.service";
import {ItemInList} from "./item-in-list.entity";
import {UpdateItemsListDto} from "./dto/update-items-list";
import {RecipeService} from "../recipe/recipe.service";

@Injectable()
export class ListService {
    constructor(
        @Inject(forwardRef(() => ProductService)) private productService: ProductService,
        @Inject(forwardRef(() => RecipeService)) private recipeService: RecipeService,
    ) {
    }

    async getLists(): Promise<List[]> {
        return await List.find();
    }

    async getList(id: string): Promise<List> {
        try {
            return await List.findOneOrFail({
                where: {id},
                relations: ['items', 'recipes', 'recipes.items']
            });
        } catch (e) {
            return;
        }
    }

    async hasList(name: string): Promise<boolean> {
        return (await this.getLists()).some(list => list.listName.toLowerCase() === name.toLowerCase());
    }

    async createList(list: CreateListDto): Promise<CreateListResponse> {
        const newList = new List();
        const checkName = await this.hasList(list.listName);
        if (!checkName) {
            newList.listName = list.listName;
            await newList.save();
            return {
                isSuccess: true,
                id: newList.id,
            };
        } else return {isSuccess: false};
    }

    async deleteList(id: string): Promise<DeleteListResponse> {
        const list = await this.getList(id);
        if (list) {
            // for (const item of list.items) {
            //     await item.remove();
            // }
            await list.remove();
            return {
                isSuccess: true,
            };
        } else return {
            isSuccess: false,
        };
    }

    async editList(id: string, list: CreateListDto): Promise<EditListResponse> {
        const {listName} = list;
        const check = await this.hasList(listName);
        if (!check) {
            const {affected} = await List.update(id, {
                listName,
            });
            if (affected) {
                return {isSuccess: true};
            }
        }
        return {
            isSuccess: false,
        };
    }

    async addItemToList(item: CreateItemInListDto): Promise<AddItemtoListResponse> {
        const list = await this.getList(item.listId);
        const newItem = await this.createItem(item);
        console.log('==========================================');
        console.log(newItem);
        if (list && newItem) {
            list.items.push(newItem);
            await list.save();
            return {
                isSuccess: true,
                id: newItem.id,
            };
        } else return {
            isSuccess: false
        };
    }

    // service Items in list
    async getListOfItems(): Promise<ItemInList[]> {
        return await ItemInList.find();
    }

    async getItemInList(id: string): Promise<ItemInList> {
        try {
            return await ItemInList.findOneOrFail({where: {id}});
        } catch (e) {
            return;
        }
    }

    async createItem(item: CreateItemInListDto): Promise<ItemInList> {
        try {
            const product = await this.productService.getProduct(item.itemId);
            const newItem = new ItemInList();
            newItem.product = product;
            newItem.count = item.count;
            newItem.weight = item.weight;
            await newItem.save();
            return newItem;
        } catch (e) {
            return
        }
    }

    async updateItemInList(id: string, newItem: UpdateItemsListDto): Promise<UpdateItemInListResponse> {
        const item = await this.getItemInList(id);
        if (item) {
            item.count = newItem.count;
            item.weight = newItem.weight;
            await item.save();
            return {
                isSuccess: true,
            };
        } else {
            return {isSuccess: false};
        }
    }

    async deleteItemInList(id: string) {
        const item = await this.getItemInList(id);
        if (item) {
            await item.remove();
            return {isSuccess: true};
        } else {
            return {isSuccess: false};
        }
    }

    async clearList(id: string) {
        const list = await this.getList(id);
        if (list) {
            for (const item of list.items) {
                await item.remove();
            }
            await list.save();
            return {isSuccess: true};
        } else {
            return {isSuccess: false};
        }
    }

    async addRecipeToList(listId: string, recipeId: string): Promise<AddRecipeToListResponse> {
        const list = await this.getList(listId);
        const recipe = await this.recipeService.getOneRecipe(recipeId);
        if (list && recipe) {
            list.recipes.push(recipe)
            await list.save()
            return {isSuccess: true};
        } else return {isSuccess: false};

    }

    async deleteRecipeFromList(listId: string, recipeId: string) {
        const list = await this.getList(listId);
        if (list){
           list.recipes = list.recipes.filter(recipeInList => {
                return recipeInList.id !== recipeId
            } )
            await list.save()
            return {isSuccess: true};
        } else return {isSuccess: false};
    }
}

