import React, { useState } from 'react';
import { Heart, Activity, Info, RotateCcw, AlertCircle } from 'lucide-react';

export default function App() {
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

  const getFluxType = (ea) => {
    if (ea < 0.8) return 'retarded';
    if (ea >= 0.8 && ea <= 2) return 'normal';
    if (ea > 2) return 'restrictive';
  };

  const evaluateFillingPressure = () => {
    const lvef = parseFloat(data.lvef);
    const e = parseFloat(data.eVelocity);
    const a = parseFloat(data.aVelocity);
    const ea = parseFloat(data.eaRatio);
    const ePrimeAvg = parseFloat(data.ePrimeAverage);
    const eePrime = parseFloat(data.eePrimeRatio);
    const tr = parseFloat(data.trVelocity);
    const lavi = parseFloat(data.laVolumeIndex);

    let diagnosis = '';
    let pressure = '';
    let criteria = [];
    let color = '';
    let fluxType = '';

    // Détermination du type de flux
    if (ea < 0.8) {
      fluxType = 'Flux de relaxation retardée (E/A < 0.8)';
    } else if (ea >= 0.8 && ea <= 2) {
      fluxType = 'Flux pseudo-normal (0.8 ≤ E/A ≤ 2)';
    } else {
      fluxType = 'Flux restrictif (E/A > 2)';
    }

    // ALGORITHME SELON FEVG
    if (lvef >= 50) {
      // FEVG NORMALE (≥50%)
      criteria.push(`FEVG normale: ${lvef}%`);
      criteria.push(fluxType);

      if (ea < 0.8) {
        // Relaxation retardée - Pressions normales
        diagnosis = 'Pressions de remplissage NORMALES';
        pressure = 'PCP normale';
        color = 'bg-green-100 border-green-500';
      } else if (ea > 2) {
        // Flux restrictif - Pressions élevées
        diagnosis = 'Pressions de remplissage ÉLEVÉES';
        pressure = 'PCP élevée';
        color = 'bg-red-100 border-red-500';
        criteria.push('Flux restrictif → Pressions élevées');
      } else {
        // Zone indéterminée (0.8 ≤ E/A ≤ 2) - Évaluation avec critères
        let positiveCount = 0;
        const subCriteria = [];

        // e' moyen septal < 7 ou latéral < 10
        if (parseFloat(data.ePrimeSeptal) < 7) {
          positiveCount++;
          subCriteria.push(`✓ e' septal < 7 cm/s (${data.ePrimeSeptal})`);
        } else {
          subCriteria.push(`✗ e' septal ≥ 7 cm/s (${data.ePrimeSeptal})`);
        }

        // E/e' moyen > 14
        if (eePrime > 14) {
          positiveCount++;
          subCriteria.push(`✓ E/e' moyen > 14 (${eePrime})`);
        } else {
          subCriteria.push(`✗ E/e' moyen ≤ 14 (${eePrime})`);
        }

        // Vitesse IT > 2.8 m/s
        if (tr && tr > 2.8) {
          positiveCount++;
          subCriteria.push(`✓ Vmax IT > 2.8 m/s (${tr})`);
        } else if (tr) {
          subCriteria.push(`✗ Vmax IT ≤ 2.8 m/s (${tr})`);
        }

        // LAVI > 34 mL/m²
        if (lavi && lavi > 34) {
          positiveCount++;
          subCriteria.push(`✓ LAVI > 34 mL/m² (${lavi})`);
        } else if (lavi) {
          subCriteria.push(`✗ LAVI ≤ 34 mL/m² (${lavi})`);
        }

        criteria.push(`Évaluation des critères (${positiveCount}/4):`);
        criteria.push(...subCriteria);

        if (positiveCount >= 3) {
          diagnosis = 'Pressions de remplissage ÉLEVÉES';
          pressure = 'PCP élevée';
          color = 'bg-red-100 border-red-500';
        } else if (positiveCount <= 1) {
          diagnosis = 'Pressions de remplissage NORMALES';
          pressure = 'PCP normale';
          color = 'bg-green-100 border-green-500';
        } else {
          diagnosis = 'Pressions de remplissage INDÉTERMINÉES';
          pressure = 'Évaluation non conclusive (2/4 critères)';
          color = 'bg-yellow-100 border-yellow-500';
        }
      }
    } else {
      // FEVG ALTÉRÉE (<50%)
      criteria.push(`FEVG altérée: ${lvef}%`);
      criteria.push(fluxType);

      if (ea < 0.8 || (ea >= 0.8 && ea < 2)) {
        // Relaxation retardée ou pseudo-normal
        let positiveCount = 0;
        const subCriteria = [];

        // E/e' moyen > 14
        if (eePrime > 14) {
          positiveCount++;
          subCriteria.push(`✓ E/e' moyen > 14 (${eePrime})`);
        } else {
          subCriteria.push(`✗ E/e' moyen ≤ 14 (${eePrime})`);
        }

        // Vitesse IT > 2.8 m/s
        if (tr && tr > 2.8) {
          positiveCount++;
          subCriteria.push(`✓ Vmax IT > 2.8 m/s (${tr})`);
        } else if (tr) {
          subCriteria.push(`✗ Vmax IT ≤ 2.8 m/s (${tr})`);
        }

        // LAVI > 34 mL/m²
        if (lavi && lavi > 34) {
          positiveCount++;
          subCriteria.push(`✓ LAVI > 34 mL/m² (${lavi})`);
        } else if (lavi) {
          subCriteria.push(`✗ LAVI ≤ 34 mL/m² (${lavi})`);
        }

        criteria.push(`Évaluation des critères (${positiveCount}/3):`);
        criteria.push(...subCriteria);

        if (positiveCount >= 2) {
          diagnosis = 'Pressions de remplissage ÉLEVÉES';
          pressure = 'PCP élevée';
          color = 'bg-red-100 border-red-500';
        } else if (positiveCount === 0) {
          diagnosis = 'Pressions de remplissage NORMALES';
          pressure = 'PCP normale';
          color = 'bg-green-100 border-green-500';
        } else {
          diagnosis = 'Pressions de remplissage INDÉTERMINÉES';
          pressure = 'Évaluation non conclusive (1/3 critère)';
          color = 'bg-yellow-100 border-yellow-500';
        }
      } else {
        // Flux restrictif (E/A > 2)
        diagnosis = 'Pressions de remplissage ÉLEVÉES';
        pressure = 'PCP élevée';
        color = 'bg-red-100 border-red-500';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
              Pressions de Remplissage VG
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Évaluation échocardiographique selon ESC 2016
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">Algorithme adapté à la FEVG:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>FEVG ≥ 50%:</strong> Classification du flux mitral + 4 critères</li>
                    <li><strong>FEVG {'<'} 50%:</strong> Classification du flux mitral + 3 critères</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Types de flux mitral:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Retardé:</strong> E/A {'<'} 0.8</li>
                    <li><strong>Pseudo-normal:</strong> 0.8 ≤ E/A ≤ 2</li>
                    <li><strong>Restrictif:</strong> E/A {'>'} 2</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('measurement')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <Activity className="w-5 h-5 mr-2" />
              Commencer l'évaluation
            </button>
          </div>
          
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Dr Aouadi A - CMIC - Douera
            </p>
          </footer>
        </div>
      </div>
    );
  }

  if (step === 'measurement') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mesures Échocardiographiques</h2>
            
            <div className="space-y-6">
              {/* FEVG */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-3">Fonction Ventriculaire Gauche</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FEVG (%) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={data.lvef}
                    onChange={(e) => setData({...data, lvef: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: 55"
                  />
                </div>
              </div>

              {/* Flux Mitral */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-3">Flux Mitral (Doppler pulsé)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onde E (cm/s) *
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onde A (cm/s) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.aVelocity}
                      onChange={(e) => setData({...data, aVelocity: e.target.value})}
                      onBlur={calculateEARatio}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 100"
                    />
                  </div>
                  {data.eaRatio && (
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700">
                        Ratio E/A: <span className="text-indigo-600 text-lg">{data.eaRatio}</span>
                        <span className="text-xs text-gray-600 ml-2">
                          {parseFloat(data.eaRatio) < 0.8 ? '(Retardé)' : 
                           parseFloat(data.eaRatio) > 2 ? '(Restrictif)' : 
                           '(Pseudo-normal)'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Doppler Tissulaire */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-3">Doppler Tissulaire VG *</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      e' septal (cm/s) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.ePrimeSeptal}
                      onChange={(e) => setData({...data, ePrimeSeptal: e.target.value})}
                      onBlur={calculateEPrimeAverage}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      e' latéral (cm/s) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.ePrimeLateral}
                      onChange={(e) => setData({...data, ePrimeLateral: e.target.value})}
                      onBlur={calculateEPrimeAverage}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 9"
                    />
                  </div>
                  {data.ePrimeAverage && (
                    <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm font-semibold text-gray-700">
                        e' moyen: <span className="text-purple-600 text-lg">{data.ePrimeAverage} cm/s</span>
                      </p>
                      {data.eePrimeRatio && (
                        <p className="text-sm font-semibold text-gray-700">
                          Ratio E/e': <span className="text-purple-600 text-lg">{data.eePrimeRatio}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Critères additionnels */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-700 mb-3">Paramètres Additionnels</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vmax IT (m/s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.trVelocity}
                      onChange={(e) => setData({...data, trVelocity: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 2.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Vitesse maximale de l'insuffisance tricuspide</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume OG indexé (mL/m²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.laVolumeIndex}
                      onChange={(e) => setData({...data, laVolumeIndex: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: 32"
                    />
                    <p className="text-xs text-gray-500 mt-1">Left Atrial Volume Index (LAVI)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Retour
              </button>
              <button
                onClick={evaluateFillingPressure}
                disabled={!data.lvef || !data.eVelocity || !data.aVelocity || !data.ePrimeSeptal || !data.ePrimeLateral}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculer
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">* Champs obligatoires</p>
          </div>
          
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Dr Aouadi A - CMIC - Douera
            </p>
          </footer>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Résultat de l'Évaluation</h2>
            </div>

            <div className={`${result.color} border-4 rounded-xl p-6 mb-6`}>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{result.diagnosis}</h3>
              <p className="text-lg text-gray-700 font-semibold">{result.pressure}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Analyse détaillée:</h4>
              <ul className="space-y-2">
                {result.criteria.map((criterion, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="text-indigo-500 mr-2 font-bold">•</span>
                    <span className={criterion.includes('✓') ? 'font-semibold text-green-700' : 
                                   criterion.includes('✗') ? 'text-gray-600' : ''}>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Note clinique:</strong> Cette évaluation est basée sur les recommandations ESC 2016 
                pour l'estimation des pressions de remplissage du VG. L'interprétation finale doit tenir 
                compte du contexte clinique complet du patient et des autres paramètres hémodynamiques.
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Nouvelle évaluation
            </button>
          </div>
          
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Dr Aouadi A - CMIC - Douera
            </p>
          </footer>
        </div>
      </div>
    );
  }
}