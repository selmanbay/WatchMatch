package com.matchflix.backend.helper;

public class ListTypeResolver {

    public enum ListType { WATCHED, WISHLIST, OTHER }

    public static ListType resolve(String listName) {
        if (listName == null) return ListType.OTHER;

        String lower = listName.toLowerCase();

        if (lower.contains("watch")) {
            return ListType.WATCHED;
        } else if (lower.contains("wish")) {
            return ListType.WISHLIST;
        }
        return ListType.OTHER;
    }
}
