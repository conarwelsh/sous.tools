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

class ExecutiveWatchFaceService : WatchFaceService() {

    override fun createComplicationSlotsManager(
        currentUserStyleRepository: CurrentUserStyleRepository
    ): ComplicationSlotsManager {
        val defaultDataSourcePolicy = DefaultComplicationDataSourcePolicy(SystemDataSources.NO_DATA_SOURCE)
        
        val complicationSlot = ComplicationSlot.createCanvasComplicationSlotBuilder(
            id = 1,
            canvasComplicationFactory = { _, _ ->
                object : CanvasComplication {
                    private var _data: ComplicationData = NoDataComplicationData()
                    override fun render(canvas: Canvas, bounds: Rect, zonedDateTime: ZonedDateTime, renderParameters: RenderParameters, slotId: Int) {}
                    override fun drawHighlight(canvas: Canvas, bounds: Rect, boundsType: Int, zonedDateTime: ZonedDateTime, color: Int) {}
                    override fun getData(): ComplicationData = _data
                    override fun loadData(complicationData: ComplicationData, loadDrawablesAsynchronous: Boolean) {
                        _data = complicationData
                    }
                }
            },
            complicationSlotBounds = ComplicationSlotBounds(RectF(0.2f, 0.7f, 0.4f, 0.9f)),
            supportedTypes = listOf(ComplicationType.SHORT_TEXT)
        ).setDefaultDataSourcePolicy(defaultDataSourcePolicy).build()
        
        return ComplicationSlotsManager(
            listOf(complicationSlot),
            currentUserStyleRepository
        )
    }

    override suspend fun createWatchFace(
        surfaceHolder: SurfaceHolder,
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        currentUserStyleRepository: CurrentUserStyleRepository
    ): WatchFace {
        val renderer = ExecutiveRenderer(
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

class ExecutiveRenderer(
    surfaceHolder: SurfaceHolder,
    watchState: WatchState,
    complicationSlotsManager: ComplicationSlotsManager,
    currentUserStyleRepository: CurrentUserStyleRepository
) : Renderer.CanvasRenderer2<ExecutiveRenderer.ExecutiveSharedAssets>(
    surfaceHolder,
    currentUserStyleRepository,
    watchState,
    CanvasType.HARDWARE,
    16L,
    clearWithBackgroundTintBeforeRenderingHighlightLayer = true
) {
    class ExecutiveSharedAssets : Renderer.SharedAssets {
        override fun onDestroy() {}
    }

    override suspend fun createSharedAssets(): ExecutiveSharedAssets = ExecutiveSharedAssets()

    private val textPaint = Paint().apply {
        isAntiAlias = true
        color = Color.WHITE
        textSize = 40f
        textAlign = Paint.Align.CENTER
    }

    override fun render(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: ExecutiveSharedAssets
    ) {
        canvas.drawColor(Color.BLACK)
        val timeText = String.format("%02d:%02d:%02d", zonedDateTime.hour, zonedDateTime.minute, zonedDateTime.second)
        canvas.drawText(timeText, bounds.centerX().toFloat(), bounds.centerY().toFloat(), textPaint)
    }

    override fun renderHighlightLayer(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: ExecutiveSharedAssets
    ) {
    }
}
