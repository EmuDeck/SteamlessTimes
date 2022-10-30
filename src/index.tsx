import {definePlugin, ServerAPI, staticClasses,} from "decky-frontend-lib";
import {FaRegClock} from "react-icons/fa";
import {SteamClient} from "./SteamClient"
import {AppStore} from "./AppStore";
import {App} from "./App";
import {GameActionStartParams} from "./Interfaces";
import {updatePlaytimes} from "./Api";

declare global
{
	let SteamClient: SteamClient;
	let appStore: AppStore
}

export default definePlugin((serverAPI: ServerAPI) =>
{
	let lifetimeHook = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((update: any) =>
	{
		console.log("Emutimes AppLifetimeNotification", update);
		serverAPI.callPluginMethod("on_lifetime_callback", {data: update}).then(() =>
		{
			updatePlaytimes(serverAPI);
		});
	});
	let startHook = SteamClient.Apps.RegisterForGameActionStart((actionType: number, id: string, action: string) =>
	{
		console.log("Emutimes GameActionStart", id);
		serverAPI.callPluginMethod<GameActionStartParams, {}>("on_game_start_callback", {
			idk: actionType,
			game_id: id,
			action: action
		}).then(() =>
		{
		});
	});

	let changeHook = SteamClient.Apps.RegisterForAppOverviewChanges(() =>
	{
		updatePlaytimes(serverAPI);
	});

	updatePlaytimes(serverAPI);

	return {
		title: <div className={staticClasses.Title}>Emutimes</div>,
		content: <App serverAPI={serverAPI}/>,
		icon: <FaRegClock/>,
		onDismount()
		{
			lifetimeHook!.unregister();
			startHook!.unregister();
			changeHook!.unregister();
		},
		alwaysRender: false
	};
});
