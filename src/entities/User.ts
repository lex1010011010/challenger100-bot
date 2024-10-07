import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    username!: string;

    @Column({nullable: true})
    timezone!: string;

    @Column({type: 'datetime', nullable: true})
    lastActive!: Date | null;
}
