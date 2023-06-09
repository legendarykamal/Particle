import { Form, Input, Button, Modal, Empty, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import MintNFT from './mintNFT';
import { NftListType } from '@/types/types.d';
import { listNFT, unlistNFT, settleNFT, buyNFT, retryTransaction } from '@/apis/index';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNftImageData, selectNftList, setSpinning } from '@/store/nftSlice';
import { Spin } from 'antd';

interface Props {
  tabType: string;
  setAmountModelVisible: (visible: boolean) => void;
  setEditModelVisible: (visible: boolean) => void;
  setActivateMintId: (id: string) => void;
  mint: string;
  nft: any;
  address?: string;
  auctionManager?: string;
  getNftListHandle: () => void;
  getSettleCountHandle: () => void;
  price?: string;
  uuid?: string;
  updateAuthority?: string;
}

const NftItem = (props: Props) => {
  const { tabType, setAmountModelVisible, setEditModelVisible, setActivateMintId, mint, nft = {} } = props;
  const dispatch = useAppDispatch();
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [offShelvesLoading, setOffShelvesLoading] = useState(false);
  const [settleAccountsLoading, setSettleAccountsLoading] = useState(false);
  const [toFinishLoading, setToFinishLoading] = useState(false);

  const nftImageData = useAppSelector(selectNftImageData);
  console.log(nftImageData);
  console.log(mint);
  console.log(nftImageData[mint]);

  return (
    <div className="nft-item" data-mint={mint}>
      <Spin spinning={!nftImageData[mint]} wrapperClassName="img-loading-content">
        <div className="img">{nftImageData[mint] ? <img src={nftImageData[mint]} alt={mint} /> : ''}</div>
      </Spin>
      <div className="info">
        <div className="item-row1">{nft.name}</div>
        <div className="item-row-symbol">{nft.symbol}</div>
        <div className="item-row2">
          <div className="left nft-price">
            {props.price ? (
              <>
                {' '}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.80286 13.8188C3.90696 13.7147 4.0501 13.6539 4.20191 13.6539H17.9689C18.2205 13.6539 18.3463 13.9576 18.1685 14.1354L15.4489 16.855C15.3448 16.9591 15.2017 17.0198 15.0498 17.0198H1.28281C1.03124 17.0198 0.905451 16.7162 1.08329 16.5383L3.80286 13.8188Z"
                    fill="url(#paint0_linear_354_8099)"
                  ></path>
                  <path
                    d="M3.80286 3.66482C3.9113 3.56072 4.05443 3.5 4.2019 3.5H17.9689C18.2205 3.5 18.3463 3.80362 18.1685 3.98146L15.4489 6.70103C15.3448 6.80513 15.2017 6.86585 15.0498 6.86585H1.28281C1.03124 6.86585 0.905451 6.56223 1.08329 6.3844L3.80286 3.66482Z"
                    fill="url(#paint1_linear_354_8099)"
                  ></path>
                  <path
                    d="M15.4489 8.70938C15.3448 8.60528 15.2017 8.54456 15.0498 8.54456H1.28281C1.03124 8.54456 0.905451 8.84818 1.08329 9.02601L3.80286 11.7456C3.90696 11.8497 4.0501 11.9104 4.20191 11.9104H17.9689C18.2205 11.9104 18.3463 11.6068 18.1685 11.429L15.4489 8.70938Z"
                    fill="url(#paint2_linear_354_8099)"
                  ></path>
                  <defs>
                    <linearGradient id="paint0_linear_354_8099" x1="16.6538" y1="1.87538" x2="7.1259" y2="20.1251" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"></stop>
                      <stop offset="1" stopColor="#DC1FFF"></stop>
                    </linearGradient>
                    <linearGradient id="paint1_linear_354_8099" x1="12.4877" y1="-0.299659" x2="2.95979" y2="17.9501" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"></stop>
                      <stop offset="1" stopColor="#DC1FFF"></stop>
                    </linearGradient>
                    <linearGradient id="paint2_linear_354_8099" x1="14.5575" y1="0.78106" x2="5.02959" y2="19.0308" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"></stop>
                      <stop offset="1" stopColor="#DC1FFF"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <span>{props.price}</span>
              </>
            ) : (
              ''
            )}
          </div>
          <div className="right">
            {tabType == NftListType.Market ? (
              <>
                {/* Off Shelves */}
                <Button
                  className="btn"
                  loading={offShelvesLoading}
                  onClick={() => {
                    // setOffShelvesLoading(true);
                    dispatch(setSpinning(true));
                    unlistNFT(window.solanaWallet, props.auctionManager as string)
                      .then((res) => {
                        if (res.error) {
                          throw new Error(res.error);
                        }
                        // setOffShelvesLoading(false);
                        dispatch(setSpinning(false));
                        message.success('Success');
                        // refresh data
                        if (props.getNftListHandle) {
                          props.getNftListHandle();
                        }
                      })
                      .catch((error: Error) => {
                        // setOffShelvesLoading(false);
                        dispatch(setSpinning(false));
                        if (!error.message.includes('The user rejected the request')) {
                          message.error(error.message);
                        }
                      });
                  }}
                >
                  {/* Off Shelves */}
                  Unlist
                </Button>
                {/* Buy Now */}
                <Button
                  className="btn"
                  loading={buyNowLoading}
                  type="primary"
                  onClick={() => {
                    console.log(props);
                    // setBuyNowLoading(true);
                    dispatch(setSpinning(true));
                    buyNFT(window.solanaWallet, props.auctionManager as string)
                      .then((res) => {
                        // setBuyNowLoading(false);
                        dispatch(setSpinning(false));
                        if (res.error) {
                          if (typeof res.error == 'string') {
                            throw new Error(res.error);
                          } else {
                            throw new Error(res.error?.message || res.error);
                          }
                        } else {
                          message.success('Success');
                          if (props.getSettleCountHandle) {
                            props.getSettleCountHandle();
                          }
                          if (props.getNftListHandle) {
                            props.getNftListHandle();
                          }
                        }
                      })
                      .catch((error: Error) => {
                        // setBuyNowLoading(false);
                        dispatch(setSpinning(false));
                        if (!error.message.includes('The user rejected the request')) {
                          message.error(error.message);
                        }
                      });
                  }}
                >
                  Buy Now
                </Button>
              </>
            ) : (
              ''
            )}

            {tabType == NftListType.MyNft ? (
              <>
                {/* Shelves */}
                <Button
                  className="btn"
                  type="primary"
                  onClick={() => {
                    setActivateMintId(mint);
                    setAmountModelVisible(true);
                  }}
                >
                  {/* Shelves */}
                  List
                </Button>
                {/* Edit */}
                {
                  <Button
                    className="btn"
                    disabled={props.updateAuthority != props.address}
                    onClick={() => {
                      setActivateMintId(mint);
                      setEditModelVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                }
              </>
            ) : (
              ''
            )}

            {tabType == NftListType.SettleAccounts ? (
              <>
                {/* Settle Accounts */}
                <Button
                  className="btn"
                  loading={settleAccountsLoading}
                  onClick={() => {
                    // setSettleAccountsLoading(true);
                    dispatch(setSpinning(true));
                    settleNFT(window.solanaWallet, props.uuid as string)
                      .then((res) => {
                        // setSettleAccountsLoading(false);
                        dispatch(setSpinning(false));
                        if (res.error) {
                          throw new Error(res.error);
                        } else {
                          if (props.getSettleCountHandle) {
                            props.getSettleCountHandle();
                          }
                          if (props.getNftListHandle) {
                            props.getNftListHandle();
                          }
                        }
                      })
                      .catch((error: Error) => {
                        // setSettleAccountsLoading(false);
                        dispatch(setSpinning(false));
                        if (!error.message.includes('The user rejected the request')) {
                          message.error(error.message);
                        }
                      });
                  }}
                >
                  Settle
                </Button>
              </>
            ) : (
              ''
            )}

            {tabType == NftListType.UncompletedTransaction ? (
              <>
                {/* To Finish */}
                <Button
                  className="btn"
                  loading={toFinishLoading}
                  onClick={() => {
                    setToFinishLoading(true);
                    retryTransaction(window.solanaWallet, props.uuid as string)
                      .then((res) => {
                        setToFinishLoading(false);
                        if (res.error) {
                          throw new Error(res.error);
                        } else {
                          message.success('Finish');
                          if (props.getNftListHandle) {
                            props.getNftListHandle();
                          }
                        }
                      })
                      .catch((error: Error) => {
                        setToFinishLoading(false);
                        message.error(error.message);
                      });
                  }}
                >
                  To Finish
                </Button>
              </>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NftList = (props: any) => {
  const [amountModelVisible, setAmountModelVisible] = useState(false);
  const [editModelVisible, setEditModelVisible] = useState(false);

  const nftList = useAppSelector(selectNftList);

  const [activateMintId, setActivateMintId] = useState('');
  const mintNFTRef = useRef<any>(null);
  const [editConfirmLoading, setEditConfirmLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [onShelvesForm] = Form.useForm();

  const [onShelvesLoading, setOnShelvesLoading] = useState(false);

  const address = useState<string>(window.solanaWallet?.publicKey?.toBase58());

  useEffect(() => {
    if (editModelVisible && mintNFTRef.current) {
      mintNFTRef.current.form.resetFields();
      mintNFTRef.current.initEditFormData();
    }
  }, [editModelVisible]);

  useEffect(() => {
    if (!amountModelVisible) {
      onShelvesForm.resetFields();
    }
  }, [amountModelVisible]);

  return (
    <div className="nft-list">
      {nftList && nftList.length ? (
        nftList.map((item, index) => {
          return (
            <NftItem
              {...props}
              {...item}
              address={address[0]}
              mint={item.mint}
              updateAuthority={item.nft.metadata.updateAuthority}
              tabType={props.type}
              setAmountModelVisible={setAmountModelVisible}
              setEditModelVisible={setEditModelVisible}
              setActivateMintId={setActivateMintId}
              key={index}
            />
          );
        })
      ) : (
        <div className="empty-data-content">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}

      <Modal
        title="Edit"
        forceRender={true}
        visible={editModelVisible}
        onCancel={() => setEditModelVisible(false)}
        confirmLoading={editConfirmLoading}
        onOk={() => {
          setEditConfirmLoading(true);
          mintNFTRef?.current
            ?.onFinish()
            .then(() => {
              setEditModelVisible(false);
              setEditConfirmLoading(false);
              if (props.getNftListHandle) {
                props.getNftListHandle();
              }
            })
            .catch((err: any) => {
              console.log(err);
              setEditConfirmLoading(false);
            });
        }}
      >
        <div className="white-theme-form">{<MintNFT ref={mintNFTRef} formType="edit" type={props.type} activateMintId={activateMintId} setActiveKey={() => {}} />}</div>
      </Modal>

      <Modal
        title="Set Price"
        forceRender={true}
        visible={amountModelVisible}
        confirmLoading={onShelvesLoading}
        onCancel={() => setAmountModelVisible(false)}
        onOk={() => {
          const { price } = onShelvesForm.getFieldsValue();
          if (!price) {
            message.error('Please input price（sol）');
            return false;
          }
          setOnShelvesLoading(true);
          listNFT(window.solanaWallet, window.solanaWallet?.publicKey?.toBase58(), activateMintId, price)
            .then((res) => {
              if (res.error) {
                throw new Error(res.error);
              }
              setOnShelvesLoading(false);
              setAmountModelVisible(false);
              // to market list
              if (props.setActiveKey) {
                props.setActiveKey(NftListType.Market);
              }
            })
            .catch((error) => {
              setOnShelvesLoading(false);
              if (!error.message.includes('The user rejected the request')) {
                message.error(error.message);
              }
            });
        }}
      >
        <div className="white-theme-form">
          <Form form={onShelvesForm}>
            <Form.Item label="SOL" name="price">
              <Input placeholder="Please input price（sol）" type="number" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default NftList;
