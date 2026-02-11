package com.sous.wearos.complications

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService

class DailySalesComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) {
            return null
        }
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "$1.2k").build(),
            contentDescription = PlainComplicationText.Builder(text = "Daily Sales").build()
        ).build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        // For now, we'll return placeholder data.
        // In the future, this will fetch data from the repository.
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "$1.2k").build(),
            contentDescription = PlainComplicationText.Builder(text = "Daily Sales").build()
        ).build()
    }
}
