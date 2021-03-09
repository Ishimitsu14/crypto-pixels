import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AppConfig {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column('simple-json', { default: () => null, nullable: true })
    data: { value: string, additional: object };

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string;

    @Column('timestamp', {default: () => null, nullable: true, onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: string;

}
