package com.sous.wearos.watchfaces

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.view.SurfaceHolder
import androidx.wear.watchface.*
import androidx.wear.watchface.complications.*
import androidx.wear.watchface.complications.data.*
import androidx.wear.watchface.complications.rendering.*
import androidx.wear.watchface.style.*
import java.time.ZonedDateTime

class OperatorWatchFaceService : WatchFaceService() {

    override fun createComplicationSlotsManager(
        currentUserStyleRepository: CurrentUserStyleRepository
    ): ComplicationSlotsManager {
        val defaultDataSourcePolicy = DefaultComplicationDataSourcePolicy(SystemDataSources.NO_DATA_SOURCE)
        
        val complicationSlotFactory = { id: Int, bounds: RectF, types: List<ComplicationType> ->
            ComplicationSlot.createCanvasComplicationSlotBuilder(
                id = id,
                canvasComplicationFactory = { _, _ ->
                    object : CanvasComplication {
                        override fun render(canvas: Canvas, bounds: Rect, zonedDateTime: ZonedDateTime, renderParameters: RenderParameters, slotId: Int) {}
                        override fun drawHighlight(canvas: Canvas, bounds: Rect, boundsType: Int, zonedDateTime: ZonedDateTime, color: Int) {}
                        override fun getData(): ComplicationData = NoDataComplicationData()
                    }
                },
                complicationSlotBounds = ComplicationSlotBounds(bounds),
                supportedTypes = types
            ).setDefaultDataSourcePolicy(defaultDataSourcePolicy).build()
        }

        val topLeftComplication = complicationSlotFactory(101, RectF(0.2f, 0.2f, 0.4f, 0.4f), listOf(ComplicationType.SHORT_TEXT))
        val topRightComplication = complicationSlotFactory(102, RectF(0.6f, 0.2f, 0.8f, 0.4f), listOf(ComplicationType.SHORT_TEXT))
        val bottomComplication = complicationSlotFactory(103, RectF(0.3f, 0.7f, 0.7f, 0.9f), listOf(ComplicationType.LONG_TEXT))
        val voiceComplication = complicationSlotFactory(104, RectF(0.4f, 0.4f, 0.6f, 0.6f), listOf(ComplicationType.SHORT_TEXT))

        return ComplicationSlotsManager(
            listOf(topLeftComplication, topRightComplication, bottomComplication, voiceComplication),
            currentUserStyleRepository
        )
    }

    override suspend fun createWatchFace(
        surfaceHolder: SurfaceHolder,
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        currentUserStyleRepository: CurrentUserStyleRepository
    ): WatchFace {
        val renderer = OperatorRenderer(
            surfaceHolder,
            watchState,
            complicationSlotsManager,
            currentUserStyleRepository
        )
        return WatchFace(
            watchFaceType = WatchFaceType.DIGITAL,
            renderer = renderer
        )
    }
}

class OperatorRenderer(
    surfaceHolder: SurfaceHolder,
    watchState: WatchState,
    complicationSlotsManager: ComplicationSlotsManager,
    currentUserStyleRepository: CurrentUserStyleRepository
) : Renderer.CanvasRenderer2<OperatorRenderer.OperatorSharedAssets>(
    surfaceHolder,
    currentUserStyleRepository,
    watchState,
    CanvasType.HARDWARE,
    16L,
    clearWithBackgroundTintBeforeRenderingHighlightLayer = true
) {
    class OperatorSharedAssets : Renderer.SharedAssets {
        override fun onDestroy() {}
    }

    override suspend fun createSharedAssets(): OperatorSharedAssets = OperatorSharedAssets()

    private val textPaint = Paint().apply {
        isAntiAlias = true
        color = Color.WHITE
        textSize = 50f
        textAlign = Paint.Align.CENTER
    }

    override fun render(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: OperatorSharedAssets
    ) {
        canvas.drawColor(Color.BLACK)
        val timeText = String.format("%02d:%02d", zonedDateTime.hour, zonedDateTime.minute)
        canvas.drawText(timeText, bounds.centerX().toFloat(), bounds.centerY().toFloat(), textPaint)
    }

    override fun renderHighlightLayer(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: OperatorSharedAssets
    ) {
    }
}
