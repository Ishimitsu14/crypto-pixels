import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne, JoinColumn
} from 'typeorm';
import {Product} from "./Product";

@Entity()
export class Transaction extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hash: string

    @Column()
    from: string

    @Column()
    to: string

    @Column()
    gas: string

    @Column()
    method: string

    @Column()
    gasPrice: string

    @Column()
    gasUsed: string

    @Column('timestamp')
    transactionDate: Date

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToOne(() => Product)
    @JoinColumn()
    product: Product
}