import {IProductPaginate} from "../types/TProduct";
import {connect} from "../functions";
import {Product} from "../models/Product";

class ProductPaginateService {
    private query: IProductPaginate

    constructor(query: IProductPaginate) {
        this.query = query
    }

    public async getProducts(): Promise<{ total: number; products: Product[] }> {
        await connect()
        const offset = (this.query.page - 1) * this.query.perPage
        const [ products, total ] = await Product.findAndCount({
            take: this.query.perPage,
            skip: offset,
            order: { [this.query.sortBy ? this.query.sortBy : 'id']: this.query.sortDesc }
        })
        return { total, products }
    }

}

export = ProductPaginateService