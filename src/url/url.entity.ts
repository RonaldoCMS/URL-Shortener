import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  shortCode!: string;

  @Column()
  originalUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

@Column({ nullable: true, type: 'timestamptz' })
  expiresAt!: Date | null;
}