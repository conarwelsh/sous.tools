package com.sous.wearos.complications

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService

class AvgTicketTimeComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) {
            return null
        }
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "5m 30s").build(),
            contentDescription = PlainComplicationText.Builder(text = "Average Ticket Time").build()
        ).build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        // For now, we'll return placeholder data.
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "5m 30s").build(),
            contentDescription = PlainComplicationText.Builder(text = "Average Ticket Time").build()
        ).build()
    }
}
