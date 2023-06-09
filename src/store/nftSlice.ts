import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isServer } from '@/utils/index';
import type { AppState, AppThunk } from '@/store/index';
import { NftListType, UserInfoProp, NftData } from '@/types/types.d';
// @ts-ignore
import { createIcon } from '@download/blockies';
import { isLogin as isLoginHandle } from '@/utils/index';

const createUserImg = (address: string) => {
  return createIcon({
    seed: address,
    // color: '#d242ca',
    bgcolor: '#fff',
    size: 20,
    scale: 5,
  }).toDataURL('image/png');
};

export interface NftImageData {
  [key: string]: string;
}

export interface NftState {
  userInfo: UserInfoProp;
  spinning: boolean;
  nftImageData: NftImageData;
  nftList: Array<NftData>;
  isLogin: boolean;
  chainId: number;
  hasInitializedStore: boolean;
}

const initialState: NftState = {
  userInfo: {
    userImage: isServer() ? '' : localStorage.getItem('userImage') || '',
    address: '',
    wsolBalance: 0,
    balance: 0,
  },
  chainId: isServer() ? -1 : parseInt(localStorage.getItem('chainId') || '103'),
  spinning: false,
  nftImageData: isServer() ? {} : JSON.parse(localStorage.getItem('nftImageData') || '{}'),
  isLogin: false,
  nftList: [],
  hasInitializedStore: isServer() ? false : !!localStorage.getItem('hasInitializedStore'),
};

export const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setNftList: (state, action: PayloadAction<Array<NftData>>) => {
      state.nftList = action.payload;
    },
    setUserInfo(state, action: PayloadAction<UserInfoProp>) {
      const userInfo = {
        ...state.userInfo,
        ...action.payload,
      };

      if (!userInfo.userImage) {
        userInfo.userImage = createUserImg(userInfo.address as string);
        localStorage.setItem('userImage', userInfo.userImage);
      }

      if (!userInfo.address && isLoginHandle()) {
        try {
          userInfo.address = window.solanaWallet?.publicKey?.toBase58();
        } catch (error) {
          console.log(error);
        }
      }

      state.userInfo = userInfo;
    },
    setSpinning(state, action: PayloadAction<boolean>) {
      state.spinning = action.payload;
    },
    setLogin(state, action: PayloadAction<boolean>) {
      state.isLogin = action.payload;
    },
    setNftImageData(state, action: PayloadAction<NftImageData>) {
      const { mint, imgSrc } = action.payload;
      state.nftImageData[mint] = imgSrc;
      if (!isServer()) {
        localStorage.setItem('nftImageData', JSON.stringify(state.nftImageData));
      }
    },
    setChainId(state, action: PayloadAction<number>) {
      localStorage.setItem('chainId', action.payload + '');
      state.chainId = action.payload;
    },
    setHasInitializedStore(state, action: PayloadAction<boolean>) {
      localStorage.setItem('hasInitializedStore', action.payload ? '1' : '');
      state.hasInitializedStore = action.payload;
    },
  },
});

export const { setNftList, setUserInfo, setSpinning, setNftImageData, setLogin, setChainId, setHasInitializedStore } = nftSlice.actions;

export const selectNftList = (state: AppState) => state.nft.nftList;

export const selectUserInfo = (state: AppState) => state.nft.userInfo;

export const selectSpinning = (state: AppState) => state.nft.spinning;

export const selectNftImageData = (state: AppState) => state.nft.nftImageData;

export const selecteIsLogin = (state: AppState) => state.nft.isLogin;

export const selecteChainId = (state: AppState) => state.nft.chainId;

export const selecteHasInitializedStore = (state: AppState) => state.nft.hasInitializedStore;

export default nftSlice.reducer;
