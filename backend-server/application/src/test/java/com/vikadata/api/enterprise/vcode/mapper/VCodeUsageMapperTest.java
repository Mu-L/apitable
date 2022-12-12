package com.vikadata.api.enterprise.vcode.mapper;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.api.enterprise.vcode.dto.VCodeDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p>
 * VCode Usage Mapper Test
 * </p>
 */
@Disabled
public class VCodeUsageMapperTest extends AbstractMyBatisMapperTest {

    @Autowired
    VCodeUsageMapper vCodeUsageMapper;

    @Test
    @Sql("/enterprise/sql/code-usage-data.sql")
    void testCountByCodeAndType() {
        Integer count = vCodeUsageMapper.countByCodeAndType("41", 0, 41L);
        assertThat(count).isEqualTo(1);
    }

    @Test
    @Sql({ "/enterprise/sql/code-usage-data.sql", "/enterprise/sql/code-data.sql" })
    void testSelectInvitorUserId() {
        VCodeDTO entity = vCodeUsageMapper.selectInvitorUserId(41L);
        assertThat(entity).isNotNull();
    }

}
