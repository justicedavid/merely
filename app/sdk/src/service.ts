import type { Service } from './api';
import type { Member, Setup } from './types';
import { KeyType, ICEService } from './types';
import { type AccountEntity, avatar } from './entities';
import type { Logging } from './logging';
import { getMembers } from './net/getMembers';
import { getMemberImageUrl } from './net/getMemberImageUrl';
import { getAdminMFAuth } from './net/getAdminMFAuth';
import { setAdminMFAuth } from './net/setAdminMFAuth';
import { addAdminMFAuth } from './net/addAdminMFAuth';
import { removeAdminMFAuth } from './net/removeAdminMFAuth';
import { getNodeConfig } from './net/getNodeConfig';
import { setNodeConfig } from './net/setNodeConfig';
import { addNodeAccount } from './net/addNodeAccount';
import { addNodeAccountAccess } from './net/addNodeAccountAccess';
import { removeNodeAccount } from './net/removeNodeAccount';
import { setNodeAccount } from './net/setNodeAccount';

export class ServiceModule implements Service {
  private log: Logging;
  private token: string;
  private node: string;
  private secure: boolean;

  constructor(log: Logging, node: string, secure: boolean, token: string) {
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
  }

  public async createMemberAccess(): Promise<string> {
    const { node, secure, token } = this;
    return await addNodeAccount(node, secure, token);
  }

  public async resetMemberAccess(accountId: number): Promise<string> {
    const { node, secure, token } = this;
    return await addNodeAccountAccess(node, secure, token, accountId);
  }

  public async blockMember(accountId: number, flag: boolean): Promise<void> {
    const { node, secure, token } = this;
    await setNodeAccount(node, secure, token, accountId, flag);
  }

  public async removeMember(accountId: number): Promise<void> {
    const { node, secure, token } = this;
    await removeNodeAccount(node, secure, token, accountId);
  }

  public async getMembers(): Promise<Member[]> {
    const { node, secure, token } = this;
    const accounts = await getMembers(node, secure, token);
    return accounts.map(account => {
      const { accountId, guid, handle, name, imageSet, revision, disabled, storageUsed } = account;
      const imageUrl = imageSet ? getMemberImageUrl(node, secure, token, accountId, revision) : avatar;
      return { accountId, guid, handle, name, imageUrl, disabled, storageUsed };
    });
  }

  public async getSetup(): Promise<Setup> {
    const { node, secure, token } = this;
    const entity = await getNodeConfig(node, secure, token);
    const { domain, accountStorage, enableImage, enableAudio, enableVideo, enableBinary,
      keyType, pushSupported, allowUnsealed, transformSupported, enableIce, iceService,
      iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit } = entity;
    const service = iceService === 'cloudflare' ? ICEService.Cloudflare : ICEService.Default;
    const type = keyType === 'RSA4096' ? KeyType.RSA_4096 : KeyType.RSA_2048;
    const setup = { domain, accountStorage, enableImage, enableAudio, enableVideo, enableBinary,
      keyType: type, pushSupported, allowUnsealed, transformSupported, enableIce, iceService: service,
      iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit };
    return setup;
  } 

  public async setSetup(setup: Setup): Promise<void> {
    const { node, secure, token } = this;
    const { domain, accountStorage, enableImage, enableAudio, enableVideo, enableBinary,
      keyType, pushSupported, allowUnsealed, transformSupported, enableIce, iceService,
      iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit } = setup;
    const service = iceService === ICEService.Cloudflare ? 'cloudflare' : ''
    const type = keyType === KeyType.RSA_4096 ? 'RSA4096' : 'RSA2048';
    const entity = { domain, accountStorage, enableImage, enableAudio, enableVideo, enableBinary,
      keyType: type, pushSupported, allowUnsealed, transformSupported, enableIce, iceService: service,
      iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit };
    await setNodeConfig(node, secure, token, entity);
  }

  public async checkMFAuth(): Promise<boolean> {
    const { node, secure, token } = this;
    const enabled = await getAdminMFAuth(node, secure, token);
    return enabled;
  }

  public async enableMFAuth(): Promise<{ image: string, text: string}> {
    const { node, secure, token } = this;
    const { secretImage, secretText } = await addAdminMFAuth(node, secure, token);
    return { image: secretImage, text: secretText };
  }

  public async disableMFAuth(): Promise<void> {
    const { node, secure, token } = this;
    await removeAdminMFAuth(node, secure, token);
  }

  public async confirmMFAuth(code: string): Promise<void> {
    const { node, secure, token } = this;
    await setAdminMFAuth(node, secure, token, code);
  }
}
