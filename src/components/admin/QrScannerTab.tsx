import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw, Volume2, ShieldCheck, UserCheck } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Ticket, FamilyBooking } from '../../types.ts';

interface ScanResultData {
  status: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_CONFIRMED';
  ticket: Ticket | null;
  booking: FamilyBooking | null;
  message: string;
}

export const QrScannerTab: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'jailer-qr-reader';

  // Load available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera if available
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('rear')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not enumerate cameras upfront:', err);
      });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setCheckInSuccess(false);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const cameraIdOrConfig = selectedCameraId
        ? selectedCameraId
        : { facingMode: 'environment' };

      await html5QrCodeRef.current.start(
        cameraIdOrConfig,
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (_errorMessage) => {
          // ignore frame errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start failure:', err);
      setCameraError(
        err.message || 'Unable to access device camera. Please check camera permissions.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping camera:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Temporarily pause scanner to avoid duplicate triggers
    await stopCamera();
    verifyCode(decodedText);
  };

  const verifyCode = async (tokenString: string) => {
    if (!tokenString.trim()) return;
    setIsVerifying(true);
    setCameraError(null);
    setScanResult(null);
    setCheckInSuccess(false);

    try {
      const adminToken = localStorage.getItem('jailer_admin_token');
      const res = await fetch('/api/admin/tickets/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ token: tokenString.trim() })
      });

      const data: ScanResultData = await res.json();
      setScanResult(data);

      if (data.status === 'VALID') {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.5 },
          colors: ['#10B981', '#34D399', '#F59E0B']
        });
      }
    } catch (err: any) {
      setCameraError(err.message || 'Server error while verifying ticket');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmEntry = async () => {
    if (!scanResult?.ticket) return;

    setIsCheckingIn(true);
    try {
      const adminToken = localStorage.getItem('jailer_admin_token');
      const res = await fetch('/api/admin/tickets/confirm-check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          ticket_id: scanResult.ticket.id,
          admin_user: 'Organizer'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check in ticket');
      }

      setCheckInSuccess(true);
      // Update local ticket state
      if (scanResult.ticket) {
        scanResult.ticket.ticket_status = 'CHECKED_IN';
        scanResult.ticket.checked_in_at = new Date().toISOString();
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399']
      });
    } catch (err: any) {
      setCameraError(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleResetForNext = () => {
    setScanResult(null);
    setCheckInSuccess(false);
    setManualCode('');
    setCameraError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-cinematic text-2xl font-black text-white">
          DOOR ENTRY QR SCANNER
        </h2>
        <p className="text-xs text-neutral-400">
          Scan attendee passes from your phone camera or look up ticket IDs manually.
        </p>
      </div>

      {cameraError && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Camera Notice:</span>
            <span>{cameraError}</span>
          </div>
        </div>
      )}

      {/* SCANNER VIEWPORT OR RESULT DISPLAY */}
      {!scanResult ? (
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6">
          {/* Camera Video Area */}
          <div className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-black border-2 border-dashed border-amber-900/60 flex flex-col items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/90 z-10">
                <Camera className="w-12 h-12 text-amber-400 mb-3" />
                <span className="font-cinematic text-base font-bold text-white mb-1">
                  Scanner Idle
                </span>
                <span className="text-xs text-neutral-400 mb-4 max-w-xs">
                  Position ticket QR code within camera view to scan automatically.
                </span>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Start Camera Scan
                </button>
              </div>
            )}
          </div>

          {/* Camera Controls & Switcher */}
          {isScanning && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-sm mx-auto">
              {cameras.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 w-full sm:w-auto">
                  <span>Camera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      stopCamera().then(() => startCamera());
                    }}
                    className="bg-neutral-900 border border-neutral-700 text-white rounded px-2 py-1 text-xs"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Camera ${c.id.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors cursor-pointer w-full sm:w-auto"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Fallback Manual Ticket ID Lookup */}
          <div className="pt-4 border-t border-neutral-800">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-2">
              Or Manual Ticket ID Lookup:
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyCode(manualCode);
              }}
              className="flex gap-2 max-w-md mx-auto"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. TK-JLR-8821 or JLR-..."
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isVerifying || !manualCode.trim()}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-colors cursor-pointer"
              >
                {isVerifying ? 'Checking...' : 'Verify'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* SCAN RESULTS VIEW */
        <div className="space-y-6">
          {/* 1. GREEN SUCCESS SCREEN (Valid Ticket) */}
          {scanResult.status === 'VALID' && (
            <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-950/70 via-neutral-950 to-neutral-950 border-2 border-emerald-500 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                Pass Verified &bull; Admission Authorized
              </div>

              <h3 className="font-cinematic text-3xl sm:text-4xl font-black text-white mb-6">
                TICKET VERIFIED
              </h3>

              <div className="p-5 rounded-xl bg-black/60 border border-emerald-900/60 max-w-md mx-auto space-y-3 text-left text-xs mb-8">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Guest Name:</span>
                  <span className="font-bold text-white text-sm">
                    {scanResult.booking?.full_name || 'Guest'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Ticket ID:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {scanResult.ticket?.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Booking Ref:</span>
                  <span className="font-mono text-neutral-300">
                    {scanResult.booking?.booking_reference}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-600">
                    VALID &bull; UNUSED
                  </span>
                </div>
              </div>

              {!checkInSuccess ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    onClick={handleConfirmEntry}
                    disabled={isCheckingIn}
                    className="flex-1 py-3.5 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isCheckingIn ? 'Recording Entry...' : 'CONFIRM ENTRY'}</span>
                  </button>

                  <button
                    onClick={handleResetForNext}
                    className="py-3.5 px-5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-center space-y-3">
                  <span className="font-bold text-sm block">
                    ✓ Entry Recorded Successfully! Guest Admitted.
                  </span>
                  <button
                    onClick={() => {
                      handleResetForNext();
                      startCamera();
                    }}
                    className="px-6 py-2.5 rounded-lg bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors cursor-pointer"
                  >
                    Scan Next Guest
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. ALREADY USED WARNING */}
          {scanResult.status === 'ALREADY_CHECKED_IN' && (
            <div className="p-8 rounded-2xl bg-neutral-950 border-2 border-amber-600 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h3 className="font-cinematic text-2xl sm:text-3xl font-black text-amber-400 mb-2">
                THIS TICKET HAS ALREADY BEEN USED.
              </h3>

              <p className="text-xs text-neutral-300 max-w-md mx-auto mb-6">
                {scanResult.message}
              </p>

              <div className="p-4 rounded-lg bg-black/60 border border-neutral-800 max-w-sm mx-auto text-left text-xs mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Guest:</span>
                  <span className="font-bold text-white">{scanResult.booking?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ticket ID:</span>
                  <span className="font-mono text-amber-400">{scanResult.ticket?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Checked In At:</span>
                  <span className="font-mono text-neutral-300">
                    {new Date(scanResult.ticket?.checked_in_at || '').toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  handleResetForNext();
                  startCamera();
                }}
                className="px-6 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Scan Another Ticket
              </button>
            </div>
          )}

          {/* 3. INVALID TICKET */}
          {scanResult.status === 'INVALID' && (
            <div className="p-8 rounded-2xl bg-neutral-950 border-2 border-red-700 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-400 mx-auto mb-4">
                <XCircle className="w-10 h-10" />
              </div>

              <h3 className="font-cinematic text-2xl sm:text-3xl font-black text-red-400 mb-2">
                INVALID TICKET.
              </h3>

              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                No matching active ticket found for this code. Verify that the correct QR code or reference is being presented.
              </p>

              <button
                onClick={() => {
                  handleResetForNext();
                  startCamera();
                }}
                className="px-6 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 4. TICKET NOT CONFIRMED */}
          {scanResult.status === 'NOT_CONFIRMED' && (
            <div className="p-8 rounded-2xl bg-neutral-950 border-2 border-red-900 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-400 flex items-center justify-center text-red-400 mx-auto mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h3 className="font-cinematic text-2xl sm:text-3xl font-black text-white mb-2">
                TICKET NOT CONFIRMED.
              </h3>

              <p className="text-xs text-neutral-300 max-w-md mx-auto mb-6">
                This booking has not yet been approved or UNO games are incomplete.
              </p>

              <button
                onClick={() => {
                  handleResetForNext();
                  startCamera();
                }}
                className="px-6 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Scan Another Pass
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
