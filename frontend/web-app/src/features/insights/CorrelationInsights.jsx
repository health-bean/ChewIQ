import React, { useState } from 'react';
import { useCorrelations } from '../../../../shared/hooks/useCorrelations';
import useAuth from '../../../../shared/hooks/useAuth';
import { AlertTriangle, TrendingUp, Clock, Target, Activity, Pill, Moon, Dumbbell, Brain, Heart, Eye } from 'lucide-react';
import { Button, Select } from '../../../../shared/components/ui';

const CorrelationInsights = () => {
  const [timeframeFilter, setTimeframeFilter] = useState(180);
  const [activeTab, setActiveTab] = useState('review');
  const [showMore, setShowMore] = useState(false);
  
  // Get current user from auth context
  const { user, loading: authLoading } = useAuth();
  
  // FIXED: Lower confidence threshold to get more data
  const { 
    correlations,  
    loading: correlationsLoading, 
    error
  } = useCorrelations(user?.id, 0.1, timeframeFilter); // Changed to 0.1 to capture more data

  // Helper function to determine if correlation is positive/beneficial
  const isPositiveCorrelation = (correlation) => {
    if (correlation.is_beneficial !== undefined) {
      return correlation.is_beneficial;
    }
    
    const positiveTypes = ['supplement-improvement', 'sleep-quality', 'exercise-energy'];
    const negativeTypes = ['food-symptom', 'medication-effect', 'stress-symptom', 'food-property-pattern'];
    
    if (positiveTypes.includes(correlation.type)) {
      // For positive types, check if effect is actually positive
      const effect = (correlation.effect || '').toLowerCase();
      return effect.includes('improved') || effect.includes('increased') || effect.includes('better') || effect.includes('reduced');
    }
    
    if (negativeTypes.includes(correlation.type)) return false;
    
    const text = (correlation.description || correlation.effect || '').toLowerCase();
    const positiveKeywords = ['reduce', 'improve', 'help', 'boost', 'increase energy', 'better', 'benefit'];
    const negativeKeywords = ['cause', 'trigger', 'worsen', 'amplify', 'side effect'];
    
    const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
    const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));
    
    return hasPositive && !hasNegative;
  };

  // FIXED: More lenient critical correlation check
  const isCriticalCorrelation = (correlation) => {
    return correlation.confidence >= 0.5 && !isPositiveCorrelation(correlation); // Changed from 0.7 to 0.5
  };

  // FIXED: Get emoji for correlation display
  const getCorrelationEmoji = (correlation) => {
    if (correlation.type === 'food-property-pattern') {
      return '📈'; // Pattern emoji
    }
    
    // Individual food/trigger emojis
    const trigger = correlation.trigger.toLowerCase();
    
    // Common food emojis
    if (trigger.includes('egg')) return '🥚';
    if (trigger.includes('milk') || trigger.includes('dairy')) return '🥛';
    if (trigger.includes('bread') || trigger.includes('wheat')) return '🍞';
    if (trigger.includes('cheese')) return '🧀';
    if (trigger.includes('apple')) return '🍎';
    if (trigger.includes('banana')) return '🍌';
    if (trigger.includes('tomato')) return '🍅';
    if (trigger.includes('coffee')) return '☕';
    if (trigger.includes('chocolate')) return '🍫';
    if (trigger.includes('nuts') || trigger.includes('almond')) return '🥜';
    if (trigger.includes('fish')) return '🐟';
    if (trigger.includes('chicken')) return '🐔';
    if (trigger.includes('beef')) return '🥩';
    if (trigger.includes('rice')) return '🍚';
    if (trigger.includes('pasta')) return '🍝';
    if (trigger.includes('sugar')) return '🍬';
    if (trigger.includes('wine') || trigger.includes('alcohol')) return '🍷';
    if (trigger.includes('pepper')) return '🌶️';
    if (trigger.includes('garlic')) return '🧄';
    if (trigger.includes('onion')) return '🧅';
    if (trigger.includes('carrot')) return '🥕';
    if (trigger.includes('spinach')) return '🥬';
    if (trigger.includes('orange')) return '🍊';
    if (trigger.includes('strawberry')) return '🍓';
    if (trigger.includes('avocado')) return '🥑';
    if (trigger.includes('potato')) return '🥔';
    if (trigger.includes('broccoli')) return '🥦';
    if (trigger.includes('cucumber')) return '🥒';
    if (trigger.includes('corn')) return '🌽';
    if (trigger.includes('mushroom')) return '🍄';
    if (trigger.includes('lemon')) return '🍋';
    if (trigger.includes('grape')) return '🍇';
    if (trigger.includes('peach')) return '🍑';
    if (trigger.includes('pear')) return '🍐';
    if (trigger.includes('cherry')) return '🍒';
    if (trigger.includes('pineapple')) return '🍍';
    if (trigger.includes('kiwi')) return '🥝';
    if (trigger.includes('mango')) return '🥭';
    if (trigger.includes('coconut')) return '🥥';
    if (trigger.includes('watermelon')) return '🍉';
    if (trigger.includes('melon')) return '🍈';
    if (trigger.includes('blueberry')) return '🫐';
    if (trigger.includes('olive')) return '🫒';
    if (trigger.includes('bacon')) return '🥓';
    if (trigger.includes('steak')) return '🥩';
    if (trigger.includes('turkey')) return '🦃';
    if (trigger.includes('shrimp')) return '🦐';
    if (trigger.includes('lobster')) return '🦞';
    if (trigger.includes('crab')) return '🦀';
    if (trigger.includes('salmon')) return '🐟';
    if (trigger.includes('tuna')) return '🐟';
    if (trigger.includes('yogurt')) return '🥛';
    if (trigger.includes('butter')) return '🧈';
    if (trigger.includes('honey')) return '🍯';
    if (trigger.includes('jam')) return '🍯';
    if (trigger.includes('cookie')) return '🍪';
    if (trigger.includes('cake')) return '🍰';
    if (trigger.includes('pie')) return '🥧';
    if (trigger.includes('donut')) return '🍩';
    if (trigger.includes('pizza')) return '🍕';
    if (trigger.includes('burger')) return '🍔';
    if (trigger.includes('sandwich')) return '🥪';
    if (trigger.includes('hotdog')) return '🌭';
    if (trigger.includes('taco')) return '🌮';
    if (trigger.includes('burrito')) return '🌯';
    if (trigger.includes('sushi')) return '🍣';
    if (trigger.includes('soup')) return '🍲';
    if (trigger.includes('salad')) return '🥗';
    if (trigger.includes('ice cream')) return '🍦';
    if (trigger.includes('tea')) return '🍵';
    if (trigger.includes('beer')) return '🍺';
    if (trigger.includes('soda')) return '🥤';
    if (trigger.includes('water')) return '💧';
    if (trigger.includes('juice')) return '🧃';
    
    // Medication/supplement emojis
    if (correlation.type === 'medication-effect') return '💊';
    if (correlation.type === 'supplement-improvement') return '💊';
    if (correlation.type === 'sleep-quality') return '😴';
    if (correlation.type === 'exercise-energy') return '💪';
    if (correlation.type === 'stress-symptom') return '😤';
    
    // Default based on correlation type
    if (isPositiveCorrelation(correlation)) return '✅';
    return '⚠️';
  };

  // Get appropriate icon based on correlation type
  const getCorrelationIcon = (correlation) => {
    const isPositive = isPositiveCorrelation(correlation);
    
    switch (correlation.type) {
      case 'food-property-pattern':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medication-effect':
        return <Pill className="w-5 h-5 text-red-500" />;
      case 'sleep-quality':
        return <Moon className={`w-5 h-5 ${isPositive ? 'text-green-500' : 'text-blue-500'}`} />;
      case 'exercise-energy':
        return <Dumbbell className={`w-5 h-5 ${isPositive ? 'text-green-500' : 'text-orange-500'}`} />;
      case 'stress-symptom':
        return <Brain className="w-5 h-5 text-red-500" />;
      case 'supplement-improvement':
        return <Heart className="w-5 h-5 text-green-500" />;
      case 'food-symptom':
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  // Format percentage display
  const getPercentageDisplay = (correlation) => {
    if (correlation.occurrences && correlation.total_opportunities) {
      const percentage = Math.round((correlation.occurrences / correlation.total_opportunities) * 100);
      return {
        percentage: `${percentage}%`,
        occurrence: `(${correlation.occurrences}/${correlation.total_opportunities})`
      };
    }
    
    const percentage = Math.round(correlation.confidence * 100);
    return {
      percentage: `${percentage}%`,
      occurrence: ''
    };
  };

  // Calculate impact score for sorting
  const getImpactScore = (correlation) => {
    if (correlation.impact_score !== undefined) {
      return correlation.impact_score;
    }
    
    let baseScore = correlation.confidence || 0.5;
    
    const criticalKeywords = ['severe', 'intense', 'debilitating', 'migraine', 'pain'];
    const text = (correlation.description || correlation.effect || '').toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      baseScore += 0.3;
    }
    
    if (correlation.type === 'medication-effect') {
      baseScore += 0.2;
    }
    
    return Math.min(baseScore, 1.0);
  };

  // Safe correlations array
  const safeCorrelations = correlations || [];

  // FIXED: More lenient filtering to show more data
  const getFilteredCorrelations = () => {
    // FIXED: Changed from 0.5 to 0.3 to show more data
    const baseCorrelations = safeCorrelations.filter(c => c.confidence >= 0.3);
    
    // Apply tab filter
    switch (activeTab) {
      case 'review':
        return baseCorrelations.filter(c => isCriticalCorrelation(c));
      case 'observe':
        return baseCorrelations.filter(c => !isPositiveCorrelation(c) && !isCriticalCorrelation(c));
      case 'positive':
        return baseCorrelations.filter(c => isPositiveCorrelation(c));
      default:
        return baseCorrelations;
    }
  };

  // Group correlations by trigger item (enhanced for patterns)
  const getGroupedCorrelations = () => {
    const filteredCorrelations = getFilteredCorrelations();
    const grouped = {};
    
    filteredCorrelations.forEach(correlation => {
      const trigger = correlation.trigger;
      if (!grouped[trigger]) {
        grouped[trigger] = [];
      }
      grouped[trigger].push(correlation);
    });
    
    // Sort each group by impact score
    Object.keys(grouped).forEach(trigger => {
      grouped[trigger].sort((a, b) => getImpactScore(b) - getImpactScore(a));
    });
    
    // Convert to array and sort by highest impact correlation per trigger
    const groupedArray = Object.entries(grouped).map(([trigger, correlations]) => ({
      trigger,
      correlations,
      maxImpact: Math.max(...correlations.map(c => getImpactScore(c))),
      isPattern: correlations[0].type === 'food-property-pattern'
    }));
    
    return groupedArray.sort((a, b) => b.maxImpact - a.maxImpact);
  };

  const groupedCorrelations = getGroupedCorrelations();
  const displayedGroups = showMore ? groupedCorrelations : groupedCorrelations.slice(0, 5);

  // FIXED: More lenient counts calculation
  const reviewCount = safeCorrelations.filter(c => c.confidence >= 0.3 && isCriticalCorrelation(c)).length;
  const observeCount = safeCorrelations.filter(c => c.confidence >= 0.3 && !isPositiveCorrelation(c) && !isCriticalCorrelation(c)).length;
  const positiveCount = safeCorrelations.filter(c => c.confidence >= 0.3 && isPositiveCorrelation(c)).length;
  
  // Combined loading state
  const loading = authLoading || correlationsLoading;

  // Get current tab display info
  const getTabDisplayInfo = () => {
    const totalItems = groupedCorrelations.length;
    const baseTitle = activeTab === 'review' ? 'Critical Issues to Review' : 
                     activeTab === 'observe' ? 'Patterns to Observe' :
                     'Positive Patterns to Keep Up';
    
    return { title: baseTitle, count: totalItems };
  };

  const tabInfo = getTabDisplayInfo();

  if (loading || (user && correlationsLoading)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Analyzing health patterns...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="text-yellow-800 font-semibold">Authentication Required</h3>
            <p className="text-yellow-600">Please log in to view your health insights.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Insights</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Match ReflectionView Style */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold">FILO Insights</h2>
        </div>
        <Select
          value={timeframeFilter}
          onChange={(e) => setTimeframeFilter(parseInt(e.target.value))}
          className="text-sm w-20"
        >
          <option value={30}>30d</option>
          <option value={90}>3m</option>
          <option value={180}>6m</option>
          <option value={365}>1y</option>
        </Select>
      </div>

      {/* FIXED: Debug info to see what's happening - Remove this after testing */}
      <div className="bg-gray-100 p-3 rounded text-sm">
        <strong>Debug Info:</strong> Total correlations: {safeCorrelations.length}, 
        Filtered: {getFilteredCorrelations().length}, 
        Grouped: {groupedCorrelations.length}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'review' ? 'danger' : 'ghost'}
          onClick={() => setActiveTab('review')}
          size="sm"
        >
          Review ({reviewCount})
        </Button>
        <Button
          variant={activeTab === 'observe' ? 'warning' : 'ghost'}
          onClick={() => setActiveTab('observe')}
          size="sm"
        >
          Observe ({observeCount})
        </Button>
        <Button
          variant={activeTab === 'positive' ? 'success' : 'ghost'}
          onClick={() => setActiveTab('positive')}
          size="sm"
        >
          Keep it Up ({positiveCount})
        </Button>
      </div>

      {/* Patterns Display */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            {activeTab === 'review' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {activeTab === 'observe' && <Eye className="w-5 h-5 text-orange-500" />}
            {activeTab === 'positive' && <TrendingUp className="w-5 h-5 text-green-500" />}
            <span>{tabInfo.title}</span>
            <span className="text-sm text-gray-500">({tabInfo.count} items)</span>
          </h3>
        </div>
        
        {displayedGroups.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {activeTab === 'review' ? 'No critical issues found - great news!' :
               activeTab === 'observe' ? 'No patterns to observe right now.' :
               'No positive patterns identified yet.'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'review' ? 'Keep tracking to identify potential critical triggers.' :
               activeTab === 'observe' ? 'Continue tracking to discover patterns worth monitoring.' :
               'Continue tracking to discover what works for you.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {displayedGroups.map((group, index) => (
              <div key={group.trigger} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getCorrelationIcon(group.correlations[0])}
                      <div className="flex-1">
                        {/* FIXED: Enhanced display format with emojis */}
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {getCorrelationEmoji(group.correlations[0])} {group.trigger} {group.isPattern ? 'emerging in your data' : 'trend emerging in your data'}
                        </h4>
                        {group.isPattern && group.correlations[0].contributingFoods ? (
                          <div className="text-sm text-gray-600 mt-1">
                            Pattern observed across {group.correlations[0].contributingFoods.length} foods: {group.correlations[0].contributingFoods.length > 3 
                              ? `${group.correlations[0].contributingFoods.slice(0, 3).join(', ')} and ${group.correlations[0].contributingFoods.length - 3} others`
                              : group.correlations[0].contributingFoods.join(', ')}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 mt-1">
                            {group.correlations.length === 1 
                              ? `Your body reacts ${group.correlations[0].timeWindowDescription} - ${group.correlations[0].effect}`
                              : `Multiple reactions observed: ${group.correlations.map(c => c.effect).join(', ')}`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    {group.isPattern && (
                      <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer ml-4">
                        explore &gt;
                      </div>
                    )}
                  </div>
                  
                  {/* Show detailed breakdown for patterns */}
                  {group.isPattern && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      {group.correlations.map((correlation, corrIndex) => {
                        const percentageData = getPercentageDisplay(correlation);
                        
                        return (
                          <div key={corrIndex} className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  • {correlation.effect}
                                </span>
                                {correlation.timeWindowDescription && (
                                  <span className="text-sm text-gray-500">
                                    ({correlation.timeWindowDescription})
                                  </span>
                                )}
                              </div>
                              {correlation.patternInsight && (
                                <div className="text-sm text-purple-600 ml-2 mt-1">
                                  💡 {correlation.patternInsight}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <div className="text-lg font-semibold text-gray-900">
                                {percentageData.percentage}
                              </div>
                              {percentageData.occurrence && (
                                <div className="text-sm text-gray-500">
                                  {percentageData.occurrence}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Show More/Less Button */}
            {groupedCorrelations.length > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? 
                    `Show Less (showing all ${groupedCorrelations.length} items)` : 
                    `Show More (${groupedCorrelations.length - 5} more items)`
                  }
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationInsights;