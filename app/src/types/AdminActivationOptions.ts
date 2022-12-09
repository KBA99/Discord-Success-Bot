import { User } from 'discord.js';

export const enum AdminActivationAction {
	Add = 'Add',
	Remove = 'Remove',
	Clear = 'clear',
}

export type ActivationAction =
	| AdminActivationAction.Add
	| AdminActivationAction.Remove
	| AdminActivationAction.Clear;

export interface AdminActivationOptions {
	user: User | null;
	action?: ActivationAction | string;
	amount?: number;
	private?: boolean;
}

export enum AdminCommandOption {
	register = 'register',
	moderate = 'moderate',
}

export interface ModerationArgs {
	action: AdminActivationAction;
	roleId: string;
}
