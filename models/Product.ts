import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import {IProductAttributes, IProductMetaData} from "../types/TProduct";

@Entity()
export class Product extends BaseEntity {

    public static readonly statuses = {
        NOT_SOLD: 1,
        PENDING: 2,
        GIVE_AWAY: 3,
        SOLD: 4,
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
    attributes: IProductAttributes[]

    @Column({ default: () => Product.statuses.NOT_SOLD })
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