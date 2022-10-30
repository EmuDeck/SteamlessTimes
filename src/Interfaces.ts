import {ServerAPI} from "decky-frontend-lib";

export interface PlayTimes
{
	[key: string]: number
}

export interface GameActionStartParams
{
	idk: number,
	game_id: string,
	action: string
}

export interface AppProps
{
	serverAPI: ServerAPI
}

export interface AppState
{
	play_times: PlayTimes
}