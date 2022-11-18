import {definePlugin, ServerAPI, } from "decky-frontend-lib";
import {FaRegClock} from "react-icons/fa";
import {SteamClient} from "./SteamClient"
import {AppStore} from "./AppStore";
import {App} from "./App";
import {GameActionStartParams} from "./Interfaces";
import {updatePlaytimes} from "./Api";
import {patchAppPage} from "./AppPatch";
import {Title} from "./Title";
import { debounce } from "lodash";

declare global
{
	let SteamClient: SteamClient;
	let appStore: AppStore
}

export default definePlugin((serverAPI: ServerAPI) =>
{
	const lifetimeHook = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((update: any) =>
	{
		console.log("SteamlessTimes AppLifetimeNotification", update);
		serverAPI.callPluginMethod("on_lifetime_callback", {data: update}).then(() =>
		{
			updatePlaytimes(serverAPI);
		});
	});
	const startHook = SteamClient.Apps.RegisterForGameActionStart((actionType: number, id: string, action: string) =>
	{
		console.log("SteamlessTimes GameActionStart", id);
		serverAPI.callPluginMethod<GameActionStartParams, {}>("on_game_start_callback", {
			idk: actionType,
			game_id: id,
			action: action
		}).then(() => updatePlaytimes(serverAPI));
	});
	const updatePlaytimesDebounced = debounce(() => updatePlaytimes(serverAPI), 100);
	const detailsHook = SteamClient.Apps.RegisterForAppOverviewChanges(() =>
	{
		updatePlaytimesDebounced();
	});

	const uiHook = SteamClient.Apps.RegisterForGameActionShowUI(() => updatePlaytimes(serverAPI));
	const suspendHook = SteamClient.System.RegisterForOnSuspendRequest(() =>
	{
		console.log("SteamlessTimes Suspend");
		serverAPI.callPluginMethod("on_suspend_callback", {}).then(() => updatePlaytimes(serverAPI));
	});
	const resumeHook = SteamClient.System.RegisterForOnResumeFromSuspend(() =>
	{
		console.log("SteamlessTimes Resume");
		serverAPI.callPluginMethod("on_resume_callback", {}).then(() => updatePlaytimes(serverAPI));
	});

	const appPatch = patchAppPage(serverAPI);
	return {
		title: <Title>SeamlessTimes</Title>,
		content: <App serverAPI={serverAPI}/>,
		icon: <FaRegClock/>,
		onDismount()
		{
			lifetimeHook!.unregister();
			startHook!.unregister();
			detailsHook!.unregister();
			uiHook!.unregister();
			suspendHook!.unregister();
			resumeHook!.unregister();

			serverAPI.routerHook.removePatch("/library/app/:appid", appPatch);
		}
	};
});
