import React, { useState } from 'react';
import { Heart, Activity, Info, RotateCcw, AlertCircle, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function LVFillingPressureApp() {
  const [step, setStep] = useState('intro');
  const [data, setData] = useState({
    lvef: '',
    eVelocity: '',
    aVelocity: '',
    eaRatio: '',
    ePrimeSeptal: '',
    ePrimeLateral: '',
    ePrimeAverage: '',
    eePrimeRatio: '',
    trVelocity: '',
    laVolumeIndex: ''
  });
  const [result, setResult] = useState(null);

  const calculateEARatio = () => {
    if (data.eVelocity && data.aVelocity) {
      const ratio = (parseFloat(data.eVelocity) / parseFloat(data.aVelocity)).toFixed(2);
      setData({...data, eaRatio: ratio});
    }
  };

  const calculateEPrimeAverage = () => {
    if (data.ePrimeSeptal && data.ePrimeLateral) {
      const avg = ((parseFloat(data.ePrimeSeptal) + parseFloat(data.ePrimeLateral)) / 2).toFixed(1);
      setData({...data, ePrimeAverage: avg});
      if (data.eVelocity) {
        const eePrime = (parseFloat(data.eVelocity) / parseFloat(avg)).toFixed(1);
        setData({...data, ePrimeAverage: avg, eePrimeRatio: eePrime});
      }
    }
  };

  const calculateEEPrimeRatio = () => {
    if (data.eVelocity && data.ePrimeAverage) {
      const ratio = (parseFloat(data.eVelocity) / parseFloat(data.ePrimeAverage)).toFixed(1);
      setData({...data, eePrimeRatio: ratio});
    }
  };

  const evaluateFillingPressure = () => {
    const lvef = parseFloat(data.lvef);
    const ea = parseFloat(data.eaRatio);
    const eePrime = parseFloat(data.eePrimeRatio);
    const tr = parseFloat(data.trVelocity);
    const lavi = parseFloat(data.laVolumeIndex);

    let diagnosis = '';
    let pressure = '';
    let criteria = [];
    let color = '';
    let fluxType = '';

    if (ea < 0.8) {
      fluxType = 'Flux de relaxation retardée (E/A < 0.8)';
    } else if (ea >= 0.8 && ea <= 2) {
      fluxType = 'Flux pseudo-normal (0.8 ≤ E/A ≤ 2)';
    } else {
      fluxType = 'Flux restrictif (E/A > 2)';
    }

    if (lvef >= 50) {
      criteria.push(`FEVG normale: ${lvef}%`);
      criteria.push(fluxType);

      if (ea < 0.8) {
        diagnosis = 'Pressions de remplissage NORMALES';
        pressure = 'PCP normale';
        color = 'normal';
      } else if (ea > 2) {
        diagnosis = 'Pressions de remplissage ÉLEVÉES';
        pressure = 'PCP élevée';
        color = 'elevated';
        criteria.push('Flux restrictif → Pressions élevées');
      } else {
        let positiveCount = 0;
        const subCriteria = [];

        if (parseFloat(data.ePrimeSeptal) < 7) {
          positiveCount++;
          subCriteria.push({ text: `e' septal < 7 cm/s (${data.ePrimeSeptal})`, met: true });
        } else {
          subCriteria.push({ text: `e' septal ≥ 7 cm/s (${data.ePrimeSeptal})`, met: false });
        }

        if (eePrime > 14) {
          positiveCount++;
          subCriteria.push({ text: `E/e' moyen > 14 (${eePrime})`, met: true });
        } else {
          subCriteria.push({ text: `E/e' moyen ≤ 14 (${eePrime})`, met: false });
        }

        if (tr && tr > 2.8) {
          positiveCount++;
          subCriteria.push({ text: `Vmax IT > 2.8 m/s (${tr})`, met: true });
        } else if (tr) {
          subCriteria.push({ text: `Vmax IT ≤ 2.8 m/s (${tr})`, met: false });
        }

        if (lavi && lavi > 34) {
          positiveCount++;
          subCriteria.push({ text: `LAVI > 34 mL/m² (${lavi})`, met: true });
        } else if (lavi) {
          subCriteria.push({ text: `LAVI ≤ 34 mL/m² (${lavi})`, met: false });
        }

        criteria.push({ title: `Évaluation des critères (${positiveCount}/4):`, subs: subCriteria });

        if (positiveCount >= 3) {
          diagnosis = 'Pressions de remplissage ÉLEVÉES';
          pressure = 'PCP élevée';
          color = 'elevated';
        } else if (positiveCount <= 1) {
          diagnosis = 'Pressions de remplissage NORMALES';
          pressure = 'PCP normale';
          color = 'normal';
        } else {
          diagnosis = 'Pressions de remplissage INDÉTERMINÉES';
          pressure = 'Évaluation non conclusive';
          color = 'indeterminate';
        }
      }
    } else {
      criteria.push(`FEVG altérée: ${lvef}%`);
      criteria.push(fluxType);

      if (ea < 0.8 || (ea >= 0.8 && ea < 2)) {
        let positiveCount = 0;
        const subCriteria = [];

        if (eePrime > 14) {
          positiveCount++;
          subCriteria.push({ text: `E/e' moyen > 14 (${eePrime})`, met: true });
        } else {
          subCriteria.push({ text: `E/e' moyen ≤ 14 (${eePrime})`, met: false });
        }

        if (tr && tr > 2.8) {
          positiveCount++;
          subCriteria.push({ text: `Vmax IT > 2.8 m/s (${tr})`, met: true });
        } else if (tr) {
          subCriteria.push({ text: `Vmax IT ≤ 2.8 m/s (${tr})`, met: false });
        }

        if (lavi && lavi > 34) {
          positiveCount++;
          subCriteria.push({ text: `LAVI > 34 mL/m² (${lavi})`, met: true });
        } else if (lavi) {
          subCriteria.push({ text: `LAVI ≤ 34 mL/m² (${lavi})`, met: false });
        }

        criteria.push({ title: `Évaluation des critères (${positiveCount}/3):`, subs: subCriteria });

        if (positiveCount >= 2) {
          diagnosis = 'Pressions de remplissage ÉLEVÉES';
          pressure = 'PCP élevée';
          color = 'elevated';
        } else if (positiveCount === 0) {
          diagnosis = 'Pressions de remplissage NORMALES';
          pressure = 'PCP normale';
          color = 'normal';
        } else {
          diagnosis = 'Pressions de remplissage INDÉTERMINÉES';
          pressure = 'Évaluation non conclusive';
          color = 'indeterminate';
        }
      } else {
        diagnosis = 'Pressions de remplissage ÉLEVÉES';
        pressure = 'PCP élevée';
        color = 'elevated';
        criteria.push('Flux restrictif → Pressions élevées');
      }
    }

    setResult({ diagnosis, pressure, criteria, color, fluxType });
    setStep('result');
  };

  const reset = () => {
    setData({
      lvef: '',
      eVelocity: '',
      aVelocity: '',
      eaRatio: '',
      ePrimeSeptal: '',
      ePrimeLateral: '',
      ePrimeAverage: '',
      eePrimeRatio: '',
      trVelocity: '',
      laVolumeIndex: ''
    });
    setResult(null);
    setStep('intro');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-b border-slate-200 rounded-t-lg p-8 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-50 p-4 rounded-full">
                <Heart className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl font-light text-slate-800 text-center mb-2 tracking-tight">
              Évaluation des Pressions de Remplissage
            </h1>
            <h2 className="text-xl font-light text-slate-600 text-center mb-1">
              Ventricule Gauche
            </h2>
            <p className="text-center text-slate-500 text-sm font-light tracking-wide">
              Protocole ESC 2016
            </p>
          </div>

          <div className="bg-white rounded-b-lg shadow-sm">
            <div className="p-8 space-y-6">
              <div className="border-l-2 border-blue-500 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium text-slate-800 mb-3">Algorithme diagnostique</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        <span><strong className="font-medium">FEVG ≥ 50%</strong> : Classification flux mitral + 4 critères</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        <span><strong className="font-medium">FEVG &lt; 50%</strong> : Classification flux mitral + 3 critères</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-amber-500 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium text-slate-800 mb-3">Classification du flux mitral</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                        <span><strong className="font-medium">Retardé</strong> : E/A &lt; 0.8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                        <span><strong className="font-medium">Pseudo-normal</strong> : 0.8 ≤ E/A ≤ 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                        <span><strong className="font-medium">Restrictif</strong> : E/A &gt; 2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('measurement')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <Activity className="w-5 h-5" strokeWidth={2} />
                Commencer l'évaluation
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 rounded-b-lg">
              <p className="text-center text-sm text-slate-600 font-light">
                Dr Aouadi A • CMIC • Douera
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'measurement') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-b border-slate-200 rounded-t-lg p-6 shadow-sm">
            <h2 className="text-2xl font-light text-slate-800 tracking-tight">Mesures Échocardiographiques</h2>
            <p className="text-slate-500 text-sm mt-1">Saisie des paramètres hémodynamiques</p>
          </div>

          <div className="bg-white rounded-b-lg shadow-sm p-8">
            <div className="space-y-8">
              <div className="border-l-2 border-rose-400 pl-6">
                <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  Fonction Ventriculaire Gauche
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    FEVG (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={data.lvef}
                    onChange={(e) => setData({...data, lvef: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                    placeholder="55"
                  />
                </div>
              </div>

              <div className="border-l-2 border-blue-400 pl-6">
                <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Flux Mitral (Doppler pulsé)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Onde E (cm/s) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.eVelocity}
                      onChange={(e) => setData({...data, eVelocity: e.target.value})}
                      onBlur={() => {
                        calculateEARatio();
                        calculateEEPrimeRatio();
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Onde A (cm/s) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.aVelocity}
                      onChange={(e) => setData({...data, aVelocity: e.target.value})}
                      onBlur={calculateEARatio}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="100"
                    />
                  </div>
                </div>
                {data.eaRatio && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Ratio E/A</span>
                      <span className="text-2xl font-light text-blue-600">{data.eaRatio}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {parseFloat(data.eaRatio) < 0.8 ? 'Flux retardé' : 
                       parseFloat(data.eaRatio) > 2 ? 'Flux restrictif' : 
                       'Flux pseudo-normal'}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-l-2 border-purple-400 pl-6">
                <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Doppler Tissulaire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      e' septal (cm/s) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.ePrimeSeptal}
                      onChange={(e) => setData({...data, ePrimeSeptal: e.target.value})}
                      onBlur={calculateEPrimeAverage}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      e' latéral (cm/s) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.ePrimeLateral}
                      onChange={(e) => setData({...data, ePrimeLateral: e.target.value})}
                      onBlur={calculateEPrimeAverage}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="9"
                    />
                  </div>
                </div>
                {data.ePrimeAverage && (
                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">e' moyen</span>
                      <span className="text-xl font-light text-purple-600">{data.ePrimeAverage} cm/s</span>
                    </div>
                    {data.eePrimeRatio && (
                      <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                        <span className="text-sm font-medium text-slate-700">Ratio E/e'</span>
                        <span className="text-xl font-light text-purple-600">{data.eePrimeRatio}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-l-2 border-emerald-400 pl-6">
                <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  Paramètres Additionnels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vmax IT (m/s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.trVelocity}
                      onChange={(e) => setData({...data, trVelocity: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="2.5"
                    />
                    <p className="text-xs text-slate-500 mt-1">Insuffisance tricuspide</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      LAVI (mL/m²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.laVolumeIndex}
                      onChange={(e) => setData({...data, laVolumeIndex: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                      placeholder="32"
                    />
                    <p className="text-xs text-slate-500 mt-1">Volume OG indexé</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Retour
              </button>
              <button
                onClick={evaluateFillingPressure}
                disabled={!data.lvef || !data.eVelocity || !data.aVelocity || !data.ePrimeSeptal || !data.ePrimeLateral}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-300 flex items-center justify-center gap-2"
              >
                Calculer les résultats
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              <span className="text-rose-500">*</span> Champs obligatoires
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 font-light">
              Dr Aouadi A • CMIC • Douera
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    const getResultIcon = () => {
      if (result.color === 'normal') return <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />;
      if (result.color === 'elevated') return <XCircle className="w-12 h-12 text-rose-600" strokeWidth={1.5} />;
      return <AlertTriangle className="w-12 h-12 text-amber-600" strokeWidth={1.5} />;
    };

    const getResultColor = () => {
      if (result.color === 'normal') return 'border-emerald-500 bg-emerald-50';
      if (result.color === 'elevated') return 'border-rose-500 bg-rose-50';
      return 'border-amber-500 bg-amber-50';
    };

    const getResultTextColor = () => {
      if (result.color === 'normal') return 'text-emerald-800';
      if (result.color === 'elevated') return 'text-rose-800';
      return 'text-amber-800';
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-b border-slate-200 rounded-t-lg p-6 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              {getResultIcon()}
            </div>
            <h2 className="text-2xl font-light text-slate-800 text-center tracking-tight">Résultat de l'Évaluation</h2>
          </div>

          <div className="bg-white rounded-b-lg shadow-sm">
            <div className="p-8">
              <div className={`${getResultColor()} border-2 rounded-lg p-6 mb-6`}>
                <h3 className={`text-2xl font-medium ${getResultTextColor()} mb-2`}>
                  {result.diagnosis}
                </h3>
                <p className={`text-lg ${getResultTextColor()} font-light`}>
                  {result.pressure}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <h4 className="font-medium text-slate-800 mb-4 text-lg">Analyse Détaillée</h4>
                <div className="space-y-3">
                  {result.criteria.map((criterion, index) => {
                    if (typeof criterion === 'string') {
                      return (
                        <div key={index} className="flex items-start gap-3 text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{criterion}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="space-y-2">
                          <p className="text-sm font-medium text-slate-800">{criterion.title}</p>
                          <div className="pl-4 space-y-2">
                            {criterion.subs.map((sub, subIdx) => (
                              <div key={subIdx} className="flex items-start gap-3">
                                {sub.met ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                                ) : (
                                  <XCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                                )}
                                <span className={`text-sm ${sub.met ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                  {sub.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border-l-2 border-blue-500 p-5 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium text-slate-800 mb-1">Note clinique</p>
                    <p className="leading-relaxed">
                      Cette évaluation est basée sur les recommandations ESC 2016 pour l'estimation 
                      des pressions de remplissage du ventricule gauche. L'interprétation finale doit 
                      tenir compte du contexte clinique complet du patient et des autres paramètres hémodynamiques.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <RotateCcw className="w-5 h-5" strokeWidth={2} />
                Nouvelle évaluation
              </button>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 rounded-b-lg">
              <p className="text-center text-sm text-slate-600 font-light">
                Dr Aouadi A • CMIC • Douera
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}