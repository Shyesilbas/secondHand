package com.serhat.secondhand.listing.application.port;

import java.util.List;
import java.util.UUID;

/** Sales data owned by the order module, read by the listing module without depending on order internals. */
public interface ListingSalesRankingPort {

    /** Active listing IDs ranked by units sold, best first; at most {@code limit} entries. */
    List<UUID> findTopSellingActiveListingIds(int limit);
}
