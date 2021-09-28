import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import {IProductAttribute, IProductMetaData, IProductStat} from "../types/TProduct";

@Entity()
export class Product extends BaseEntity {

    public static readonly statuses = {
        NOT_LOADED: 1,
        UPLOADED_TO_IPFS: 2,
        PENDING_SELL: 3,
        GIVE_AWAY: 4,
        SOLD: 5,
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    uuid: string;

    @Column()
    image: string

    @Column()
    gif: string

    @Column('text', {})
    hash: string

    @Column('simple-json', { nullable: true })
    metaData: IProductMetaData

    @Column('simple-json', { nullable: true })
    attributes: IProductAttribute[]

    @Column('simple-json', { nullable: true })
    stats: IProductStat[]

    @Column({ default: () => Product.statuses.NOT_LOADED })
    status: number

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @Column('timestamp', {default: () => null, nullable: true, onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: string;

    @Column('timestamp', {default: () => null, nullable: true})
    soldAt: string;

    setMetaData(metaData: IProductMetaData) {
        this.metaData = metaData
        return this
    }

}