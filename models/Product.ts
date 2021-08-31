import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    uuid: string;

    @Column()
    path: string

    @Column()
    hash: string

    @Column('json', { default: () => null })
    metaData: string

    @Column()
    isSelling: boolean

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @Column('timestamp', {default: () => null, nullable: true, onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: string;

    @Column('timestamp', {default: () => null, nullable: true})
    sellingAt: string;

}