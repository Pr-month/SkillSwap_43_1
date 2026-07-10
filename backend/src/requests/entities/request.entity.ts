import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { REQUEST_STATUS } from './request.enum';
import { Skill } from '../../skills/entities/skill.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.outgoingRequests, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.incomingRequests, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: REQUEST_STATUS,
    default: REQUEST_STATUS.PENDING,
  })
  status: REQUEST_STATUS;

  @ManyToOne(() => Skill, (skill) => skill.offeredRequests)
  @JoinColumn({ name: 'offeredSkillId' })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, (skill) => skill.requestedRequests)
  @JoinColumn({ name: 'requestedSkillId' })
  requestedSkill: Skill;

  @Column({
    type: 'boolean',
    default: false,
  })
  isRead: boolean;
}
