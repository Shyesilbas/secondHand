package com.serhat.secondhand.listing.application.filter;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.hibernate.query.criteria.JpaExpression;

import java.util.Collection;

/**
 * Filter predicates on {@code listings.attributes} (JSONB) values, for attributes marked {@code filterable}.
 * A listing that did not answer the attribute never matches.
 */
public final class ListingAttributePredicates {

    private ListingAttributePredicates() {
    }

    private static Expression<String> text(CriteriaBuilder cb, Path<?> attributes, String key) {
        return cb.function("jsonb_extract_path_text", String.class, attributes, cb.literal(key));
    }

    public static Predicate booleanEquals(CriteriaBuilder cb, Path<?> attributes, String key, boolean value) {
        return cb.equal(text(cb, attributes, key), Boolean.toString(value));
    }

    // A real SQL cast: Expression.as() is only a type hint in Hibernate 6 and leaves text <= integer.
    // INTEGER attributes are validated on write, so the stored value always casts.
    private static Expression<Integer> integer(CriteriaBuilder cb, Path<?> attributes, String key) {
        return ((JpaExpression<String>) text(cb, attributes, key)).cast(Integer.class);
    }

    public static Predicate integerAtLeast(CriteriaBuilder cb, Path<?> attributes, String key, int min) {
        return cb.greaterThanOrEqualTo(integer(cb, attributes, key), min);
    }

    public static Predicate integerAtMost(CriteriaBuilder cb, Path<?> attributes, String key, int max) {
        return cb.lessThanOrEqualTo(integer(cb, attributes, key), max);
    }

    /** ENUM attributes: the stored option value is one of {@code values}. */
    public static Predicate textIn(CriteriaBuilder cb, Path<?> attributes, String key, Collection<String> values) {
        return text(cb, attributes, key).in(values);
    }
}
