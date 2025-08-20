// src/main/java/com/matchflix/backend/util/LongListJsonConverter.java
package com.matchflix.backend.utility;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

@Converter(autoApply = false)
public class LongListJsonConverter implements AttributeConverter<List<Long>, String> {
    private static final ObjectMapper om = new ObjectMapper();
    @Override public String convertToDatabaseColumn(List<Long> attribute) {
        try { return om.writeValueAsString(attribute == null ? Collections.emptyList() : attribute); }
        catch (Exception e) { throw new IllegalArgumentException(e); }
    }
    @Override public List<Long> convertToEntityAttribute(String dbData) {
        try { return dbData == null ? Collections.emptyList() : om.readValue(dbData, new TypeReference<List<Long>>(){}); }
        catch (Exception e) { return Collections.emptyList(); }
    }
}
