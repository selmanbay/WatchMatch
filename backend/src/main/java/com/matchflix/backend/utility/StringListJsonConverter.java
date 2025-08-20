// src/main/java/com/matchflix/backend/util/StringListJsonConverter.java
package com.matchflix.backend.utility;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

@Converter(autoApply = false)
public class StringListJsonConverter implements AttributeConverter<List<String>, String> {
    private static final ObjectMapper om = new ObjectMapper();
    @Override public String convertToDatabaseColumn(List<String> attribute) {
        try { return om.writeValueAsString(attribute == null ? Collections.emptyList() : attribute); }
        catch (Exception e) { throw new IllegalArgumentException(e); }
    }
    @Override public List<String> convertToEntityAttribute(String dbData) {
        try { return dbData == null ? Collections.emptyList() : om.readValue(dbData, new TypeReference<List<String>>(){}); }
        catch (Exception e) { return Collections.emptyList(); }
    }
}
