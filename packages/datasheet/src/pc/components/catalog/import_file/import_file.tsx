import { TextButton, useThemeColors } from '@vikadata/components';
import { Api, ConfigConstant, IReduxState, Navigation, StoreActions, Strings, t } from '@apitable/core';
import { Progress, Upload } from 'antd';
import { Message, Modal } from 'pc/components/common';
import { Router } from 'pc/components/route_manager/router';
import { useAppDispatch } from 'pc/hooks/use_app_dispatch';
import { usePercent } from 'pc/hooks/use_percent';
import { byte2Mb } from 'pc/utils';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import FailIcon from 'static/icon/common/common_tip_default_small.svg';
import SuccessIcon from 'static/icon/common/common_tip_success_small.svg';
import UploadIcon from 'static/icon/workbench/workbench_tip_upload.svg';
import styles from './style.module.less';

const { Dragger } = Upload;

export interface IImportFileProps {
  parentId: string;
  onCancel: () => void;
}

let reqToken: () => void;

type ProgressType = 'normal' | 'active' | 'success' | 'exception' | undefined;

export const ImportFile: FC<IImportFileProps> = ({
  parentId,
  onCancel,
}) => {
  const colors = useThemeColors();
  const spaceId = useSelector(state => state.space.activeId);
  const expandedKeys = useSelector((state: IReduxState) => state.catalogTree.expandedKeys);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [file, setFile] = useState<File>();
  const [errMsg, setErrMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcess, setProcessing] = useState(false);
  const dispatch = useAppDispatch();
  const { percent, stop: stopPercent, start: startPercent } = usePercent(60, 99, 1500);

  const [isFail, setIsFail] = useState<ProgressType>(ConfigConstant.PROGRESS_NORMAL);

  const onUploadProgress = progressEvent => {
    if (!isUploading) {
      setIsUploading(true);
    }
    if (progressEvent.loaded / progressEvent.total === 1) {
      startPercent();
    }
    const value = Math.floor(progressEvent.loaded / progressEvent.total * 100 * 0.6);
    setUploadPercent(value);
  };

  const customRequest = (componentsData: any) => {
    setFile(componentsData.file);
    uploadFile(componentsData.file);
  };

  const uploadFile = (curFile: File) => {
    if (!spaceId) {
      return;
    }
    if (byte2Mb(curFile.size)! > 20) {
      Modal.danger({
        title: t(Strings.no_access_space_title),
        content: t(Strings.import_file_outside_limit),
      });
      return;
    }
    const formData = new FormData();
    formData.append('file', curFile);
    formData.append('parentId', parentId);
    formData.append('spaceId', spaceId);
    setProcessing(true);
    Api.importFile(formData, onUploadProgress, c => {
      reqToken = c;
    }).then(res => {
      stopPercent();
      setProcessing(false);
      const { success, data, message } = res.data;
      if (success) {
        dispatch(StoreActions.setExpandedKeys([...expandedKeys, parentId]));
        dispatch(StoreActions.addNode(data));
        dispatch(StoreActions.getSpaceInfo(spaceId));
        Router.push(Navigation.WORKBENCH, {
          params: {
            spaceId,
            nodeId: data.nodeId,
          },
        });
        setTimeout(() => {
          onCancel();
        }, 3000);
      } else {
        setErrMsg(message);
        setIsFail(ConfigConstant.PROGRESS_EXCEPTION);
      }
      dispatch(StoreActions.clearNode());
    }).catch(() => {
      setProcessing(false);
      setIsFail(ConfigConstant.PROGRESS_EXCEPTION);
      stopPercent();
    });
  };
  
  const handleReSelect = () => {
    setIsUploading(false);
    setProcessing(false);
    setUploadPercent(0);
    setIsFail(ConfigConstant.PROGRESS_NORMAL);
  };
  
  const handleCancel = () => {
    if (!reqToken) {
      return;
    }
    reqToken();
    Message.success({ content: `${t(Strings.cancel)}${t(Strings.upload_success)}` });
    setUploadPercent(0);
    setFile(undefined);
    setIsUploading(false);
    stopPercent();
    setProcessing(false);
    setIsFail(ConfigConstant.PROGRESS_NORMAL);
  };
  
  const failPage = () => {
    return (
      <div className={styles.fail}>
        <div className={styles.failProgress}>
          <FailIcon width={40} height={40} fill={colors.errorColor} />
        </div>
        <div className={styles.status}>{t(Strings.import_failed)}</div>
        <div className={styles.tip}>{errMsg}</div>
        <TextButton
          className={styles.selectBtn}
          onClick={handleReSelect}
        >
          {t(Strings.reselect)}
        </TextButton>
      </div>
    );
  };
  
  const successPage = () => {
    return (
      <div className={styles.success}>
        <div className={styles.successProgress}>
          <SuccessIcon width={40} height={40} fill={colors.primaryColor} />
        </div>
        <div className={styles.fileName}>{file!.name}</div>
      </div>
    );
  };
  
  const processPage = () => {
    return (
      <div className={styles.process}>
        <Progress type='circle' percent={uploadPercent < 60 ? uploadPercent : percent} strokeColor={colors.primaryColor} width={80} />
        <div className={styles.fileName}>{file!.name}</div>
        {uploadPercent < 60 &&
          < div
            className={styles.cancelBtn}
            onClick={handleCancel}
          >
            {t(Strings.import_canceled)}
          </div>
        }
      </div>
    );
  };

  const handleClose = () => {
    if (isProcess) {
      return;
    }
    onCancel();
  };

  return (
    <Modal
      title={t(Strings.import_file)}
      width={540}
      visible
      footer={null}
      wrapClassName={styles.createSpaceWrapper}
      bodyStyle={{
        width: '100%',
        height: '410px',
        padding: '24px',
      }}
      maskClosable={false}
      onCancel={handleClose}
      centered
    >
      {isUploading ?
        (
          <div className={styles.upload}>
            {isProcess ? processPage() : (
              isFail === ConfigConstant.PROGRESS_EXCEPTION ? failPage() :
                successPage()
            )}
          </div>
        ) : (
          <Dragger
            customRequest={customRequest}
            showUploadList={false}
            accept='.xlsx,.xls,.csv'
          >
            <div>
              <UploadIcon width={50} height={50} fill={colors.fourthLevelText} />
            </div>
            <div className={styles.tip}>{t(Strings.invite_ousider_import_file_tip1)}</div>
            <div className={styles.format}>{t(Strings.invite_ousider_import_file_tip3)}</div>
          </Dragger>
        )
      }
    </Modal>
  );
};
