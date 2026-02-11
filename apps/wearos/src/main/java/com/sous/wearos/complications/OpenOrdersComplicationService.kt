package com.sous.wearos.complications

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService

class OpenOrdersComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) {
            return null
        }
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "5").build(),
            contentDescription = PlainComplicationText.Builder(text = "Open Orders").build()
        ).build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "5").build(),
            contentDescription = PlainComplicationText.Builder(text = "Open Orders").build()
        ).build()
    }
}
