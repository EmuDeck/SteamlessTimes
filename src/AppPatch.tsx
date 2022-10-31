import {afterPatch, ServerAPI, ServerResponse} from "decky-frontend-lib";
import {ReactElement} from "react";
import {PlayTimes} from "./Interfaces";

export const patchAppPage = (serverAPI: ServerAPI) => {
	return serverAPI.routerHook.addPatch("/library/app/:appid", (props: { path: string, children: ReactElement}) =>
	{
		afterPatch(
			props.children.props,
			"renderFunc",
			(_: Record<string, unknown>[], ret1: ReactElement) => {
				const game_id: string = ret1.props.children.props.overview.m_gameid;
				serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
				{
					if (response.success)
					{
						if (response.result[game_id])
							ret1.props.children.props.details.nPlaytimeForever = +(response.result[game_id] / 60.0).toFixed(1);
					}
				});
				return ret1;
			}
		);
		return props;
	});
}