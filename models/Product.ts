import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';

@Entity()
export class Product extends BaseEntity {

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

    @Column('json', { nullable: true })
    metaData: string

    @Column('json', { nullable: true })
    attributes: string

    @Column('boolean', { default: () => false })
    isSold: boolean

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @Column('timestamp', {default: () => null, nullable: true, onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: string;

    @Column('timestamp', {default: () => null, nullable: true})
    soldAt: string;

}