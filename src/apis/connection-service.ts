import { Connection } from '@solana/web3.js';
import { CHAIN_ID, IPFS_URL, RPC_METHOD, SOLANA_RPC_URL } from './common-types';
import { createBasicAuthString } from './utils';
import Axios from 'axios';

export default new (class ConnectionService {
  private chainId: CHAIN_ID = 103;
  private projectId: string = '';
  private projectClientKey: string = '';

  public setChainId(chainId: number) {
    this.chainId = chainId;
  }

  public setProject(projectId: string, projectClientKey: string) {
    console.log('setProject', projectId, projectClientKey);

    this.projectId = projectId;
    this.projectClientKey = projectClientKey;
  }

  public async rpcRequest(method: RPC_METHOD, ...params: any[]) {
    try {
      const { data } = await Axios.post(
        SOLANA_RPC_URL,
        {
          chainId: 103,
          method: method,
          params,
        },
        {
          auth: {
            username: this.projectId,
            password: this.projectClientKey,
          },
        }
      );

      return data;
    } catch (error) {
      return { error };
    }
  }

  public async uploadFile(fromData: FormData) {
    try {
      let { data } = await Axios.post(IPFS_URL, fromData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        auth: {
          username: this.projectId,
          password: this.projectClientKey,
        },
      });

      return data;
    } catch (error) {
      return { error };
    }
  }

  public getConnection(): Connection {
    return new Connection(`${SOLANA_RPC_URL}?chainId=${this.chainId}`, {
      commitment: 'confirmed',
      httpHeaders: {
        Authorization: createBasicAuthString(this.projectId, this.projectClientKey),
      },
    });
  }
})();