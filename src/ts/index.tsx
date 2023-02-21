import {definePlugin, ServerAPI, } from "decky-frontend-lib";
import {FaRegClock} from "react-icons/fa";
import {Hook, SteamClient} from "./SteamClient"
import {AppStore} from "./AppStore";
import {App} from "./App";
import {GameActionStartParams} from "./Interfaces";
import {updatePlaytimesThrottled} from "./Api";
import {patchAppPage, patchHomePage} from "./AppPatch";
import {Title} from "./Title";
import {registerForLoginStateChange} from "./LibraryInitializer";

declare global
{
	// @ts-ignore
	let SteamClient: SteamClient;
	// @ts-ignore
	let appStore: AppStore
}
export default definePlugin((serverAPI: ServerAPI) =>
{
	let overviewHook: Hook | undefined;
	const lifetimeHook = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((update: any) =>
	{
		serverAPI.callPluginMethod("on_lifetime_callback", {data: update}).then(() =>
		{
			updatePlaytimesThrottled(serverAPI);
		});
	});
	const startHook = SteamClient.Apps.RegisterForGameActionStart((actionType: number, id: string, action: string) =>
	{
		serverAPI.callPluginMethod<GameActionStartParams, {}>("on_game_start_callback", {
			idk: actionType,
			game_id: id,
			action: action
		}).then(() => updatePlaytimesThrottled(serverAPI));
	});
	const loginHook = registerForLoginStateChange(() => {
		if (overviewHook == undefined)
		{
			overviewHook = SteamClient.Apps.RegisterForAppOverviewChanges(() =>
			{
				updatePlaytimesThrottled(serverAPI);
			});
			updatePlaytimesThrottled(serverAPI);
		}
	}, () => {
		if (overviewHook != undefined)
		{
			overviewHook.unregister();
			overviewHook = undefined;
		}
	});

	const uiHook = SteamClient.Apps.RegisterForGameActionShowUI(() => updatePlaytimesThrottled(serverAPI));
	const suspendHook = SteamClient.System.RegisterForOnSuspendRequest(() =>
	{
		serverAPI.callPluginMethod("on_suspend_callback", {}).then(() => updatePlaytimesThrottled(serverAPI));
	});
	const resumeHook = SteamClient.System.RegisterForOnResumeFromSuspend(() =>
	{
		serverAPI.callPluginMethod("on_resume_callback", {}).then(() => updatePlaytimesThrottled(serverAPI));
	});

	const appPatch = patchAppPage(serverAPI);
	const homePatch = patchHomePage(serverAPI);
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
			loginHook!();
			uiHook!.unregister();
			suspendHook!.unregister();
			resumeHook!.unregister();

			serverAPI.routerHook.removePatch("/library/app/:appid", appPatch);
			serverAPI.routerHook.removePatch("/library/home", homePatch);
		}
	};
});
