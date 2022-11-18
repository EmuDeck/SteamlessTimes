import {AppOverview} from "./SteamClient";
import {ObservableMap} from "mobx";

export interface AppStore
{
	m_mapApps: ObservableMap<number, AppOverview>;
	UpdateAppOverview: any,
	GetAppOverviewByAppID: (id: number) => AppOverview,
	GetAppOverviewByGameID: (id: string) => AppOverview,
	CompareSortAs: any,
	allApps: any,
	storeTagCounts: any,
	GetTopStoreTags: any,
	OnLocalizationChanged: any,
	GetStoreTagLocalization: any,
	GetLocalizationForStoreTag: any,
	AsyncGetLocalizationForStoreTag: any,
	sharedLibraryAccountIds: any,
	siteLicenseApps: any,
	GetIconURLForApp: any,
	GetLandscapeImageURLForApp: any,
	GetCachedLandscapeImageURLForApp: any,
	GetVerticalCapsuleURLForApp: any,
	GetPregeneratedVerticalCapsuleForApp: any
	GetCachedVerticalCapsuleURL: any,
	GetCustomImageURLs: any,
	GetCustomVerticalCapsuleURLs: any,
	GetCustomLandcapeImageURLs: any,
	GetCustomHeroImageURLs: any,
	GetCustomLogoImageURLs: any,
	GetStorePageURLForApp: any
}