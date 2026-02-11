package com.sous.wearos.complications

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService

class LongestOpenOrderComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.LONG_TEXT) {
            return null
        }
        return LongTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "Order 12: 15m").build(),
            contentDescription = PlainComplicationText.Builder(text = "Longest Open Order").build()
        ).build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        return LongTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "Order 12: 15m").build(),
            contentDescription = PlainComplicationText.Builder(text = "Longest Open Order").build()
        ).build()
    }
}
