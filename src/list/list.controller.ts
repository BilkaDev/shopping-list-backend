import {Body, Controller, Delete, Get, Inject, Param, Patch, Post} from '@nestjs/common';
import {ListService} from "./list.service";
import {
    CreateListResponse,
    DeleteListResponse,
    EditListResponse,
    GetListResponse,
    GetListsResponse
} from "../interfaces/list/list";
import {CreateListDto} from "./dto/create-list";
import {CreateItemInListDto} from "./dto/create-item-in-list";
import {AddItemtoListResponse, UpdateItemInListResponse} from "../interfaces/list/item-in-list";
import {UpdateItemsListDto} from "./dto/update-items-list";

@Controller('list')
export class ListController {
    constructor(
        @Inject(ListService) private listService: ListService,
    ) {
    }

    @Get('/')
    getLists(): Promise<GetListsResponse> {
        return this.listService.getLists();
    }

    @Get('/:id')
    getList(
        @Param('id') id: string
    ): Promise<GetListResponse> {
        return this.listService.getList(id);
    }

    @Post('/')
    createList(
        @Body() list: CreateListDto,
    ): Promise<CreateListResponse> {
        return this.listService.createList(list);
    }

    @Post('/item')
    addProductToList(
        @Body() newProduct: CreateItemInListDto,
    ): Promise<AddItemtoListResponse> {
        return this.listService.addItemToList(newProduct);
    }

    @Patch('/:id')
    editList(
        @Param('id') id: string,
        @Body() list: CreateListDto,
    ): Promise<EditListResponse> {
        return this.listService.editList(id, list);
    }

    @Patch('/item/:id')
    updateItemInList(
        @Param('id') id: string,
        @Body() items: UpdateItemsListDto,
    ): Promise<UpdateItemInListResponse> {
        return this.listService.updateItemInList(id, items);
    }

    @Delete('/:id')
    deleteList(
        @Param('id') id: string,
    ): Promise<DeleteListResponse> {
        return this.listService.deleteList(id);
    }
    @Delete('/item/:id')
    deleteItemInList(
        @Param('id') id: string,
    ): Promise<DeleteListResponse> {
        return this.listService.deleteItemInList(id);
    }
    @Delete('/item/clear/:id')
    clearList(
        @Param('id') id: string,
    ): Promise<DeleteListResponse> {
        return this.listService.clearList(id);
    }
}
