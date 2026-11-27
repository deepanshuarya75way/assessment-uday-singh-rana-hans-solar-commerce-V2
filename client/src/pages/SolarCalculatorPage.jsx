import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Zap, Maximize2, TrendingUp, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/format';


const TARIFF_PER_KWH = 8;
const AREA_PER_KW_SQFT = 100;
const COST_PER_KW = 55000;

export default function SolarCalculatorPage() {
   const navigate = useNavigate();
   const [inputMode, setInputMode] = useState('bill');
   const [monthlyBill, setMonthlyBill] = useState(4000);
   const [monthlyUnits, setMonthlyUnits] = useState(500);
   const [roofAngle, setRoofAngle] = useState(25);
   const [sunshineHours, setSunshineHours] = useState(5.5);

   const calc = useMemo(() => {
    const effectiveUnits = 
    inputMode === 'bill'? Math.max(0, Number(monthlyBill) || 0) /
    TARIFF_PER_KWH : Math.max(0, Number(monthlyUnits) || 0);

    const effectiveBill =
    inputMode === 'bill' ? Math.max(0, Number(monthlyBill) || 0) :
    effectiveUnits * TARIFF_PER_KWH;

    const tiltEfficiency = Math.max(0.75, 1 - Math.abs(roofAngle - 28) * 0.005);
    const dailyKwhNeeded = effectiveUnits / 30;
    const rawKw = dailyKwhNeeded / (sunshineHours * tiltEfficiency);
    const recommendedKw = Math.max(1, Math.round(rawKw * 2) / 2);

    const requiredAreaSqFt = Math.round(recommendedKw * AREA_PER_KW_SQFT);
    const annualGenerationKwh= Math.round(recommendedKw * sunshineHours * 365 * tiltEfficiency);
    const monthlyGenerationKwh = Math.round(annualGenerationKwh / 12);


    const estimatedMonthlySavings = Math.min(effectiveBill,
      Math.round(monthlyGenerationKwh * TARIFF_PER_KWH));
      const remainingMonthlyBill = Math.max(0, Math.round(effectiveBill - estimatedMonthlySavings));
      const annualSavings = estimatedMonthlySavings * 12;
      const estimatedSystemCost = recommendedKw* COST_PER_KW;
      const roiYears = annualSavings > 0 ? (estimatedSystemCost / annualSavings).toFixed(1) : '-';

      return {
        effectiveBill: Math.round(effectiveBill),
        recommendedKw,
        requiredAreaSqFt,
        annualGenerationKwh,
        estimatedMonthlySavings,
        remainingMonthlyBill,
        annualSavings,
        estimatedSystemCost,
        roiYears,

      };
}, [inputMode, monthlyBill, monthlyUnits, roofAngle, sunshineHours]);


const handleAttachToEnquiry = () => {
  const prefillMessage = [
    `Solar Sizing Report:`,
    `- Recommended Capacity: ${calc.recommendedKw} KW`,
    `- Required Rooftop Area: ${calc.requiredAreaSqFt} sq ft`,
    `- Roof Angle: ${roofAngle}* | Daily Sunshine: ${sunshineHours} hrs`,
    `- Projected Annual Generation:
    ${calc.annualGenerationKwh.toLocalString(en-IN)} kWh/yr`,
    `- Est. Monthly Savings:
    ${formatCurrency(calc.estimatedMonthlySavings)} (ROI: ~${calc.roiYears} yrs)`,
  ].join('\n');

  navigate('/contact' , { state: {prefillMessage} });
};


const savingsRatio = calc.effectiveBill > 0 ?
Math.round((calc.estimatedMonthlySavings / calc.effectiveBill) * 100) : 0;

return(
  <div className="bg-gray-50 py-10 sm:py-14">

  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mb-8 text-center">

    <p className ="text-xs font-semibol uppercase tracking-wider text-solar-600">
      Interactive Rooftop Tool
    </p>

    <h1 className="mt-2 text-3xl font-bold text-charcoal sm:text-4xl">
      Solar Sizing &amp; Bill Savings Calculator 
    </h1>

    <p className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shdow-sm sm:p-8">
        <div className = "flex gap-2 rounded-xl bg-grey-100 p-1">

        <button
        type="button"
        onClick={() => setInputMode('bill')}
        className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
          inputMode === 'bill' ? 'bg-white text-solar-700 shadow-sm' : 'text-grey-600'
        }`}
        >
          Monthly Bill ($)
          </button>
          <button
          type =  "button"
          onClick={() => setInputMode('units')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            inputMode === 'units' ? 'bg-white text-color-700 shadow-sm' : 'text-grey-600'
          }`}
          >
            Units Consumed (KWH)
            </button>

            </div>

            {inputMode} === 'bill' ? (
              <div>
                <label className = "black text-sm font-semibold text-charcoal">
                  Monthly Electricity Bill ($)
                </label>
              <input
              type="number"
              min={500}
              step={100}
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base font-medium focus:border-solar-500 focus:outline-none"
              />
              </div>

            ) : (
              <div>
                <label className = "block text-sm font-semibold text-charcoal">

                </label>

                <input 
                type="number"
                min={50}
                step={10}
                value={monthlyUnits}
                onChange="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base font-medium focus:border-solar-500 focus:outline-none"
                />
                </div>
            )

            <div className="flex justify-between text-sm font-semibold text-charcoal">
              <span>{roofAngle} deg</span>
              <span className="text-solar-700">{roofAngle}*</span>
            </div>

            <input
            type="range"
            min={0}
            max={60}
            step = {1} 
            value = {roofAngle}
            onChange={(e) => setRoofAngle(Number(e.target.value))}
            className="mt-2 w-full accent-solar-600"
            />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-charcoal">
                <span>Daily Sunshine Hours</span>
                <span className="text-solar-700"> {sunshineHours}
                
                hrs/day</span>
            </div>

            <input type="range"
            min={3}
            max={8}
            step={0.5}
            value={sunshineHours}
            onChange={(e) => setSunshineHours(Number(e.target.value))}
            className="mt-2 w-full accent-solar-600"
            />
            </div>


            <button
            type="button"
            onClick={handleAttachToEnquiry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-solar-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-solar-700"
            >
              Attach to Enquiry 

              <ArrowRight classNmae="h-4 w-4" />

            </button></p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className ="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                    <Zap className="h-4 w-4 text-solar-600" />
                    Recommended Capacity
                    
                  </div>
                  <p className = "mt-2 text-2xl font-bold text-charcoal">
                  {calc.recommendedKw} KW </p> 

                
                <div className = "rounded-2xl text-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                    <Maximize2 className = "h-4 w-4 text-solar-600" />
                    Required Rooftop Area

              </div>

              <p className ="mt-2 text-2xl font-bold text-charcoal">

             {calc.requiredAreaSqFt} sq ft</p>
            </div>

            <div className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-grey-500">
                <Sun className="h-4 w-4 text-amber-500" />
                Annual Generation 
                </div>
                <p className="mt-2 text-2xl font-bold text-charcoal">
                  {calc.annualGenerationKwh.toLocaleString('en-IN')} kWh
                </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className ="flex items-center gap-2 text-xs font-semibold uppercase text-geay-500">

                    <TrendingUp className="h-4 w-4 text-emerald-600"/>
                    Est. ROI Timeline
                    </div>
                    <p ClassName="mt-2 text-2xl font-bold text-emrald-700">
                      {calc.roiYears} Years</p>
                    </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className= "text-base font-bold text-charcoal">
                        Monthly Bill Saving Brekdown 
                      </h2>

                      <p className="mt-1 text-sm text-gray-600">
                        Estimated Monthly Savings:{''}
                        <span className="font-bold text-emrald-700">
                          {formatCurrency(calc.estimatedMonthlySavings)}
                          ({savingsRatio}%)
                        </span>
                      </p>

                      <div className= "mt-5 space-y-4">

                      <div>
                        <div className="mb-1 flex justify-between text-xs font-semibold text-gray-600">
                          <span>Current Monthly Bill</span>
                          <span>{formatCurrency(calc.effectiveBill)}</span>
                          </div>

                          <div className="h-4 w-full overflow-hidden rounded-full bg-grey-100">
                            <div className="h-full w-full rounded-full bg-slate-400" />

                            </div>
                            </div>

                            <div>
                              <div className="mb-1 flex justify-between text-xs font-semibold text-emerald-700">
                                <span> Estimated Monthly Savings </span>
                                <span>{formatCurrency(calc.estimatedMonthlySavings)}
                                  </span>
                                  </div>

                                  <div cclassName="h-4 w-full overflow-hidden rounded-full bg-grey-100">
                                    <div 
                                    className="h-full rounded-full bg-emerald-500 transition-all diration-300"
                                    style={{ width: `${Math.min(100, savingsRatio)}%` }}
                                    />
                                    </div>
                                    </div>


                                    <div>
                                      <div className="mb-1 flex justify-between text-xs font-semibold text-amber-700">
                                        <span> Remaining Montly Bill </span>
                                        <span>{formatCurrency(calc.remainingMonthlyBill)}</span>
                                        </div>

                                        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">

                                        <div className="h-full rounded-full bg-amber-400 transition-all duration-300"
                                        style={{ width: `${Math.max(0, 100 - savingsRatio)}%`}}

                                        />
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        
                                        

          );
          </div>
        )



                            





      }