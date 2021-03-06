import { Activity } from "./Activity";
import { ClientStatus, Status } from "./Status";
import { Schema, Types, Document } from "mongoose";
import db from "../util/Database";
import toBigInt from "../util/toBigInt";

export const PublicUserProjection = {
	username: true,
	discriminator: true,
	id: true,
	public_flags: true,
	avatar: true,
};
export interface User {
	id: string;
	username: string; // username max length 32, min 2
	discriminator: string; // #0001 4 digit long string from #0001 - #9999
	avatar: string | null; // hash of the user avatar
	phone?: string; // phone number of the user
	desktop: boolean; // if the user has desktop app installed
	mobile: boolean; // if the user has mobile app installed
	premium: boolean; // if user bought nitro
	premium_type: number; // nitro level
	bot: boolean; // if user is bot
	system: boolean; // shouldn't be used, the api sents this field type true, if the genetaed message comes from a system generated author
	nsfw_allowed: boolean; // if the user is older than 18 (resp. Config)
	mfa_enabled: boolean; // if multi factor authentication is enabled
	created_at: Date; // registration date
	verified: boolean; // if the user is offically verified
	email?: string; // email of the user
	flags: bigint; // UserFlags
	public_flags: bigint;
	user_settings: UserSettings;
	guilds: string[]; // array of guild ids the user is part of
	user_data: UserData;
	presence: {
		status: Status;
		activities: Activity[];
		client_status: ClientStatus;
	};
}

// Privat user data:
export interface UserData {
	valid_tokens_since: Date; // all tokens with a previous issue date are invalid
	relationships: Relationship[];
	connected_accounts: ConnectedAccount[];
	hash: string; // hash of the password, salt is saved in password (bcrypt)
	fingerprints: string[]; // array of fingerprints -> used to prevent multiple accounts
}

export interface UserDocument extends User, Document {
	id: string;
}

export interface PublicUser {
	id: string;
	discriminator: string;
	username: string;
	avatar?: string;
	public_flags: bigint;
}

export interface ConnectedAccount {
	access_token: string;
	friend_sync: boolean;
	id: string;
	name: string;
	revoked: boolean;
	show_activity: boolean;
	type: string;
	verifie: boolean;
	visibility: number;
}

export interface Relationship {
	id: string;
	nickname?: string;
	type: number;
	user_id: string;
}

export interface UserSettings {
	afk_timeout: number;
	allow_accessibility_detection: boolean;
	animate_emoji: boolean;
	animate_stickers: number;
	contact_sync_enabled: boolean;
	convert_emoticons: boolean;
	custom_status: {
		emoji_id: string | null;
		emoji_name: string | null;
		expires_at: number | null;
		text: string | null;
	};
	default_guilds_restricted: boolean;
	detect_platform_accounts: boolean;
	developer_mode: boolean;
	disable_games_tab: boolean;
	enable_tts_command: boolean;
	explicit_content_filter: number;
	friend_source_flags: { all: boolean };
	gateway_connected: boolean;
	gif_auto_play: boolean;
	guild_folders: // every top guild is displayed as a "folder"
	{
		color: number;
		guild_ids: string[];
		id: number;
		name: string;
	}[];
	guild_positions: string[]; // guild ids ordered by position
	inline_attachment_media: boolean;
	inline_embed_media: boolean;
	locale: string; // en_US
	message_display_compact: boolean;
	native_phone_integration_enabled: boolean;
	render_embeds: boolean;
	render_reactions: boolean;
	restricted_guilds: string[];
	show_current_game: boolean;
	status: "online" | "offline" | "dnd" | "idle";
	stream_notifications_enabled: boolean;
	theme: "dark" | "white"; // dark
	timezone_offset: number; // e.g -60
}

export const UserSchema = new Schema({
	id: String,
	username: String,
	discriminator: String,
	avatar: String,
	phone: String,
	desktop: Boolean,
	mobile: Boolean,
	premium: Boolean,
	premium_type: Number,
	bot: Boolean,
	system: Boolean,
	nsfw_allowed: Boolean,
	mfa_enabled: Boolean,
	created_at: Date,
	verified: Boolean,
	email: String,
	flags: { type: String, get: toBigInt }, // TODO: automatically convert Types.Long to BitField of UserFlags
	public_flags: { type: String, get: toBigInt },
	guilds: [String], // array of guild ids the user is part of
	user_data: {
		fingerprints: [String],
		hash: String, // hash of the password, salt is saved in password (bcrypt)
		valid_tokens_since: Date, // all tokens with a previous issue date are invalid
		relationships: [
			{
				id: String,
				nickname: String,
				type: Number,
				user_id: String,
			},
		],
		connected_accounts: [
			{
				access_token: String,
				friend_sync: Boolean,
				id: String,
				name: String,
				revoked: Boolean,
				show_activity: Boolean,
				type: String,
				verifie: Boolean,
				visibility: Number,
			},
		],
	},
	user_settings: {
		afk_timeout: Number,
		allow_accessibility_detection: Boolean,
		animate_emoji: Boolean,
		animate_stickers: Number,
		contact_sync_enabled: Boolean,
		convert_emoticons: Boolean,
		custom_status: {
			emoji_id: String,
			emoji_name: String,
			expires_at: Number,
			text: String,
		},
		default_guilds_restricted: Boolean,
		detect_platform_accounts: Boolean,
		developer_mode: Boolean,
		disable_games_tab: Boolean,
		enable_tts_command: Boolean,
		explicit_content_filter: Number,
		friend_source_flags: { all: Boolean },
		gateway_connected: Boolean,
		gif_auto_play: Boolean,
		// every top guild is displayed as a "folder"
		guild_folders: [
			{
				color: Number,
				guild_ids: [String],
				id: Number,
				name: String,
			},
		],
		guild_positions: [String], // guild ids ordered by position
		inline_attachment_media: Boolean,
		inline_embed_media: Boolean,
		locale: String, // en_US
		message_display_compact: Boolean,
		native_phone_integration_enabled: Boolean,
		render_embeds: Boolean,
		render_reactions: Boolean,
		restricted_guilds: [String],
		show_current_game: Boolean,
		status: String,
		stream_notifications_enabled: Boolean,
		theme: String, // dark
		timezone_offset: Number, // e.g -60,
	},

	presence: {
		status: String,
		activities: [Activity],
		client_status: ClientStatus,
	},
});

// @ts-ignore
export const UserModel = db.model<UserDocument>("User", UserSchema, "users");
