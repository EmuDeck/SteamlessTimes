import {afterPatch, ServerAPI, ServerResponse} from "decky-frontend-lib";
import {ReactElement} from "react";
import {PlayTimes} from "./Interfaces";
import {Patching} from "./Patching";

export const patchAppPage = (serverAPI: ServerAPI) => {
	return serverAPI.routerHook.addPatch("/library/app/:appid", (props: { path: string, children: ReactElement}) =>
	{
		afterPatch(
				props.children.props,
				"renderFunc",
				(_, ret) =>
				{
					const game_id: string = ret.props.children.props.overview.m_gameid;
					// console.log(game_id);
					serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
					{
						if (response.success)
						{
							// console.log(response.result)
							if (response.result[game_id])
							{
								ret.props.children.props.details.nPlaytimeForever = +(response.result[game_id] / 60.0).toFixed(1);
								console.log(+(response.result[game_id] / 60.0).toFixed(1));
							}
						}
					});
					return ret;
				}
		)
		return props;
	});
}

export const patchAppPageExperimental = (serverAPI: ServerAPI) => {
	return serverAPI.routerHook.addPatch("/library/app/:appid", (props: { path: string, children: ReactElement}) =>
	{
		Patching.patch(props.children, {})
			.afterPatchBasic(ret => ret.props, "renderFunc", (_, ret, vars) =>
			{
				const game_id: string = ret.props.children.props.overview.m_gameid;
				// console.log(game_id);
				serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
				{
					if (response.success)
					{
						// console.log(response.result)
						if (response.result[game_id])
						{
							ret.props.children.props.details.nPlaytimeForever = +(response.result[game_id] / 60.0).toFixed(1);
							console.log(+(response.result[game_id] / 60.0).toFixed(1));
						}
					}
				});
				return {ret, vars};
			})
			.done()
		.done();
	});
}


