package com.vikadata.api.enterprise.billing.mapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractIntegrationTest;
import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.api.enterprise.billing.mapper.SubscriptionMapper;
import com.vikadata.api.enterprise.billing.enums.SubscriptionState;
import com.vikadata.api.enterprise.billing.enums.ProductCategory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p>
 * Subscription Billing System - Subscription Mapper Test
 * </p>
 */
@Disabled
public class SubscriptionMapperTest extends AbstractMyBatisMapperTest {

    @Autowired
    private SubscriptionMapper subscriptionMapper;

    @Test
    @Sql("/testdata/billing-subscription-data.sql")
    public void testSelectUnExpireCapacityBySpaceId(){
        String spaceId = "spcSueRmAkuPP";
        assertThat(subscriptionMapper.selectUnExpireCapacityBySpaceId(spaceId, new Page<>(), SubscriptionState.ACTIVATED)).isNotNull();
    }

    @Test
    @Sql("/testdata/billing-subscription-data.sql")
    public void testSelectExpireCapacityBySpaceId(){
        String spaceId = "spcSueRmAkuPP";
        assertThat(subscriptionMapper.selectExpireCapacityBySpaceId(spaceId, new Page<>()).getRecords()).isEmpty();
    }

    @Test
    @Sql("/testdata/billing-subscription-data.sql")
    public void testSelectUnExpireGiftCapacityBySpaceId(){
        String spaceId = "spcSueRmAkuPP";
        String planId = "capacity_300_MB";
        assertThat(subscriptionMapper.selectUnExpireGiftCapacityBySpaceId(spaceId,planId, SubscriptionState.ACTIVATED)).isNotNull();
    }

    @Test
    @Sql("/testdata/billing-subscription-data.sql")
    public void testSelectUnExpireBaseProductBySpaceId(){
        String spaceId = "spcSueRmAkuPP";
        assertThat(subscriptionMapper.selectUnExpireBaseProductBySpaceId(spaceId, SubscriptionState.ACTIVATED, ProductCategory.BASE)).isEqualTo(0);
    }
}
