package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Only vehicle and real estate listings need the creation fee before they can be published. */
class ListingPublishFeeTest {

    private static Listing draft(ListingType type, boolean feePaid) {
        Listing listing = new Listing();
        listing.setListingType(type);
        listing.setStatus(ListingStatus.DRAFT);
        listing.setListingFeePaid(feePaid);
        return listing;
    }

    @Test
    void vehicleAndRealEstateCannotPublishWithoutTheFee() {
        for (ListingType type : new ListingType[]{ListingType.VEHICLE, ListingType.REAL_ESTATE}) {
            Listing listing = draft(type, false);
            assertThat(listing.canBePublished()).isFalse();
            assertThatThrownBy(listing::publish).isInstanceOf(BusinessException.class);
        }
    }

    @Test
    void vehicleWithPaidFeePublishes() {
        Listing listing = draft(ListingType.VEHICLE, true);
        listing.publish();
        assertThat(listing.getStatus()).isEqualTo(ListingStatus.ACTIVE);
    }

    @Test
    void otherTypesPublishWithoutAnyFee() {
        for (ListingType type : new ListingType[]{ListingType.ELECTRONICS, ListingType.CLOTHING, ListingType.BOOKS,
                ListingType.SPORTS, ListingType.OTHER}) {
            Listing listing = draft(type, false);
            assertThat(listing.requiresCreationFee()).isFalse();
            listing.publish();
            assertThat(listing.getStatus()).isEqualTo(ListingStatus.ACTIVE);
        }
    }

    @Test
    void feeBearingTypesAreExactlyVehicleAndRealEstate() {
        assertThat(ListingType.creationFeeTypes()).containsExactlyInAnyOrder(ListingType.VEHICLE, ListingType.REAL_ESTATE);
    }
}
