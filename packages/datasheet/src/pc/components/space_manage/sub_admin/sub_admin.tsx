import { Button, TextButton, Typography, useThemeColors } from '@vikadata/components';
import { ConfigConstant, Events, IReduxState, ISubAdminList, Player, StoreActions, Strings, t } from '@vikadata/core';
import { useMount } from 'ahooks';
import { Pagination, Table } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { triggerUsageAlert } from 'pc/common/billing';
import { SubscribeUsageTipType } from 'pc/common/billing/subscribe_usage_check';
import { InfoCard, Modal } from 'pc/components/common';
import { getSocialWecomUnitName } from 'pc/components/home/social_platform';
import { useNotificationCreate } from 'pc/hooks';
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AddAdminModal, ModalType } from './add_admin_modal';
import styles from './style.module.less';

// 一些已经不使用的权限，但是因为旧空间还是会返回相应的数据，前端对这些权限做过滤
const UNUSED_PERMISSION = ['MANAGE_NORMAL_MEMBER'];

export const SubAdmin: FC = () => {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);
  const { subAdminList, subAdminListData, user, subscription, spaceInfo } = useSelector((state: IReduxState) => ({
    subAdminList: state.spacePermissionManage.subAdminListData ?
      state.spacePermissionManage.subAdminListData.records : [],
    subAdminListData: state.spacePermissionManage.subAdminListData,
    user: state.user.info,
    subscription: state.billing.subscription,
    spaceInfo: state.space.curSpaceInfo,
  }), shallowEqual);
  const [modalType, setModalType] = useState<string | null>(null);
  const [editOrReadSubMainInfo, setEditOrReadSubMainInfo] = useState<ISubAdminList | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [scrollHeight, setScrollHeight] = useState(0);
  const { delSubAdminAndNotice } = useNotificationCreate({ fromUserId: user!.uuid, spaceId: user!.spaceId });

  const subAdminMax = subscription ? Math.max(subscription.maxAdminNums - 1, 0) : 0;

  useMount(() => {
    Player.doTrigger(Events.space_setting_sub_admin_shown);
  });
  useEffect(() => {
    dispatch(StoreActions.getSubAdminList(pageNo));
  }, [dispatch, pageNo]);
  const updateScroll = useCallback(() => {
    if (tableRef.current) {
      const height = tableRef.current.clientHeight - 45;
      setScrollHeight(height);
    }
  }, [tableRef]);
  useLayoutEffect(() => {
    updateScroll();
  });
  useEffect(() => {
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll]);

  const getPermissionContent = (arr: Array<string>) => {
    const i18nStrings = arr.filter(item => {
      return !UNUSED_PERMISSION.includes(item);
    }).map(item => {
      return t(Strings[`role_permission_${item.toLowerCase()}`]);
    });
    return i18nStrings.join(' & ');
  };
  const addAdminBtnClick = () => {
    const result = triggerUsageAlert(
      'maxAdminNums',
      { usage: subAdminList.length, alwaysAlert: true },
      SubscribeUsageTipType.Alert,
    );
    if (result) return;
    setModalType(ModalType.Add);
  };
  const editBtnClick = (record: ISubAdminList) => {
    setModalType(ModalType.Edit);
    setEditOrReadSubMainInfo(record);
  };
  const delBtnClick = (info: ISubAdminList) => {
    const title = getSocialWecomUnitName({
      name: info.memberName,
      isModified: info.isMemberNameModified,
      spaceInfo
    });
    const isTitleStr = typeof title === 'string';
    let content: string | JSX.Element;
    if (isTitleStr) {
      content = t(Strings.space_manage_confirm_del_sub_admin_content, {
        memberName: info.memberName,
      });
    } else {
      const _content = t(Strings.space_manage_confirm_del_sub_admin_content, {
        memberName: ReactDOMServer.renderToStaticMarkup(title as JSX.Element),
      });
      content = <span dangerouslySetInnerHTML={{ __html: _content }} />;
    }
    Modal.confirm({
      title: t(Strings.space_manage_confirm_del_sub_admin_title),
      content,
      onOk: () => {
        delSubAdminAndNotice(info.memberId);
      },
      type: 'danger',
    });
  };
  const cancelModal = () => {
    setModalType(null);
    setEditOrReadSubMainInfo(null);
  };
  const columns: ColumnProps<ISubAdminList>[] = [
    {
      title: t(Strings.member_family_name),
      dataIndex: 'memberName',
      key: 'memberName',
      render: (value, record) => {
        const title = getSocialWecomUnitName({
          name: record?.memberName,
          isModified: record?.isMemberNameModified,
          spaceInfo
        });
        return (
          <InfoCard
            title={title || record.memberName || t(Strings.unnamed)}
            description={record.team}
            key={record.id}
            avatarProps={{
              id: record.memberId,
              title: record.memberName || t(Strings.unnamed),
              src: record.avatar,
            }}
          />
        );
      },
      align: 'left',
    },
    {
      title: t(Strings.permission_bound),
      dataIndex: 'resourceGroupCodes',
      key: 'resourceGroupCodes',
      render: value => getPermissionContent(value),
      ellipsis: true,
      align: 'left',
    },
    {
      title: t(Strings.operate),
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      render: (value, record) => {
        return (
          <div className={styles.operateBtn}>
            <TextButton
              color='primary'
              onClick={() => editBtnClick(record)}
              size='small'
            >
              {t(Strings.edit)}
            </TextButton>
            <span>|</span>
            <TextButton
              color='danger'
              onClick={() => delBtnClick(record)}
              size='small'
            >
              {t(Strings.delete)}
            </TextButton>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.subAdmin}>
      <Typography variant={'h6'}>
        {t(Strings.sub_admin)}
      </Typography>
      <Typography variant={'body4'} color={colors.thirdLevelText} className={styles.describe}>
        {t(Strings.space_admin_info, { count: subAdminMax })}
      </Typography>
      <div>
        <Button
          onClick={addAdminBtnClick}
          variant='jelly'
        >
          {t(Strings.add_sub_admin)}
        </Button>
      </div>

      <div className={styles.tableWrapper} ref={tableRef}>
        <Table
          columns={columns}
          dataSource={subAdminList}
          pagination={false}
          rowKey={record => record.memberId}
          scroll={{ y: scrollHeight }}
        />
      </div>
      {
        subAdminListData && subAdminListData.total > ConfigConstant.SUB_ADMIN_LIST_PAGE_SIZE &&
        <div className={styles.pagination}>
          <Pagination
            current={pageNo}
            total={subAdminListData ? subAdminListData.total : 0}
            onChange={(pageNo: number) => setPageNo(pageNo)}
            defaultPageSize={ConfigConstant.SUB_ADMIN_LIST_PAGE_SIZE}
            className='pagination'
            showSizeChanger={false}
          />
        </div>
      }
      {modalType && <AddAdminModal
        cancelModal={cancelModal}
        source={modalType}
        editOrReadSubMainInfo={editOrReadSubMainInfo}
        existSubAdminNum={subAdminList.length}
      />}
      {}
    </div>
  );
};
