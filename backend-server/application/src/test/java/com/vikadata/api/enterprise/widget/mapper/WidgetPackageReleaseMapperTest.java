package com.vikadata.api.enterprise.widget.mapper;

import java.util.List;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.api.enterprise.widget.dto.LastSubmitWidgetVersionDTO;
import com.vikadata.api.enterprise.widget.ro.WidgetStoreListRo;
import com.vikadata.api.enterprise.widget.vo.WidgetReleaseListVo;
import com.vikadata.api.enterprise.widget.vo.WidgetStoreListInfo;
import com.vikadata.entity.WidgetPackageReleaseEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

@Disabled
public class WidgetPackageReleaseMapperTest extends AbstractMyBatisMapperTest {

    @Autowired
    WidgetPackageReleaseMapper widgetPackageReleaseMapper;

    @Test
    @Sql("/enterprise/sql/widget-package-release-data.sql")
    void testSelectReleaseShaToId() {
        Long id = widgetPackageReleaseMapper.selectReleaseShaToId("41", 0);
        assertThat(id).isEqualTo(41L);
    }

    @Test
    @Sql("/enterprise/sql/widget-package-release-data.sql")
    void testSelectReleasePage() {
        IPage<WidgetReleaseListVo> page = widgetPackageReleaseMapper.selectReleasePage(new Page<>(), "wpk41");
        assertThat(page.getTotal()).isEqualTo(1);
    }

    @Test
    @Sql({ "/enterprise/sql/widget-package-auth-space-data.sql", "/enterprise/sql/widget-package-data.sql"
            , "/enterprise/sql/widget-package-release-data.sql" })
    void testSelectWaitReviewWidgetList() {
        List<WidgetStoreListInfo> entities = widgetPackageReleaseMapper.selectWaitReviewWidgetList(new WidgetStoreListRo());
        assertThat(entities).isNotEmpty();
    }

    @Test
    @Sql({ "/enterprise/sql/widget-package-auth-space-data.sql", "/enterprise/sql/widget-package-data.sql"
            , "/enterprise/sql/widget-package-release-data.sql" })
    void testSelectLastWidgetVersionInfoByFatherWidgetId() {
        LastSubmitWidgetVersionDTO entity = widgetPackageReleaseMapper.selectLastWidgetVersionInfoByFatherWidgetId("wi0");
        assertThat(entity).isNotNull();
    }

    @Test
    @Sql({ "/enterprise/sql/widget-package-data.sql", "/enterprise/sql/widget-package-release-data.sql" })
    void testSelectByFatherWidgetIdAndVersion() {
        WidgetPackageReleaseEntity entity = widgetPackageReleaseMapper.selectByFatherWidgetIdAndVersion("wi0", "1.0.0");
        assertThat(entity).isNotNull();
    }

}
