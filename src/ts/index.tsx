import {definePlugin, ServerAPI, } from "decky-frontend-lib";
import {FaRegClock} from "react-icons/fa";
import {Hook, SteamClient} from "./SteamClient"
import {AppStore} from "./AppStore";
import {App} from "./App";
import {GameActionStartParams} from "./Interfaces";
import {updatePlaytimesThrottled} from "./Api";
import {patchAppPage} from "./AppPatch";
import {Title} from "./Title";

declare global
{
	// @ts-ignore
	let SteamClient: SteamClient;
	// @ts-ignore
	let appStore: AppStore
}

let isLoggedIn = false;

export default definePlugin((serverAPI: ServerAPI) =>
{
	let overviewHook: Hook | undefined;
	const lifetimeHook = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((update: any) =>
	{
		console.log("SteamlessTimes AppLifetimeNotification", update);
		serverAPI.callPluginMethod("on_lifetime_callback", {data: update}).then(() =>
		{
			updatePlaytimesThrottled(serverAPI);
		});
	});
	const startHook = SteamClient.Apps.RegisterForGameActionStart((actionType: number, id: string, action: string) =>
	{
		console.log("SteamlessTimes GameActionStart", id);
		serverAPI.callPluginMethod<GameActionStartParams, {}>("on_game_start_callback", {
			idk: actionType,
			game_id: id,
			action: action
		}).then(() => updatePlaytimesThrottled(serverAPI));
	});
	const loginHook = SteamClient.User.RegisterForLoginStateChange((e: string) => {
		console.log("SteamlessTimes LoginStateChange", e)
		isLoggedIn = e !== "";
		if (isLoggedIn && overviewHook == undefined)
		{
			overviewHook = SteamClient.Apps.RegisterForAppOverviewChanges(() =>
			{
				console.log("SteamlessTimes AppOverviewChanges");
				updatePlaytimesThrottled(serverAPI);
			});
		}
		else if (!isLoggedIn && overviewHook != undefined)
		{
			overviewHook.unregister();
			overviewHook = undefined;
		}
	});

	const uiHook = SteamClient.Apps.RegisterForGameActionShowUI(() => updatePlaytimesThrottled(serverAPI));
	const suspendHook = SteamClient.System.RegisterForOnSuspendRequest(() =>
	{
		console.log("SteamlessTimes Suspend");
		serverAPI.callPluginMethod("on_suspend_callback", {}).then(() => updatePlaytimesThrottled(serverAPI));
	});
	const resumeHook = SteamClient.System.RegisterForOnResumeFromSuspend(() =>
	{
		console.log("SteamlessTimes Resume");
		serverAPI.callPluginMethod("on_resume_callback", {}).then(() => updatePlaytimesThrottled(serverAPI));
	});

	if (isLoggedIn)
		updatePlaytimesThrottled(serverAPI);

	const appPatch = patchAppPage(serverAPI);
	return {
		title: <Title>SeamlessTimes</Title>,
		content: <App serverAPI={serverAPI}/>,
		icon: <FaRegClock/>,
		onDismount()
		{
			lifetimeHook!.unregister();
			startHook!.unregister();
			if (overviewHook)
				overviewHook.unregister();
			loginHook!.unregister();
			uiHook!.unregister();
			suspendHook!.unregister();
			resumeHook!.unregister();

			serverAPI.routerHook.removePatch("/library/app/:appid", appPatch);
		}
	};
});
