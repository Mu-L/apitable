package com.vikadata.api.enterprise.idaas.mapper;

import javax.annotation.Resource;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.entity.IdaasAppBindEntity;

import org.springframework.test.context.jdbc.Sql;

/**
 * <p>
 * IDaaS Bind application test
 * </p>
 */
class IdaasAppBindMapperTests extends AbstractMyBatisMapperTest {

    @Resource
    private IdaasAppBindMapper idaasAppBindMapper;

    @Test
    @Sql("/enterprise/sql/idaas-app-bind-data.sql")
    void selectBySpaceIdtest() {
        IdaasAppBindEntity entity = idaasAppBindMapper.selectBySpaceId("spc6jJS5lX9UJ");

        Assertions.assertNotNull(entity);
        Assertions.assertEquals("spc6jJS5lX9UJ", entity.getSpaceId());
    }

}
