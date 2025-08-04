import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { Button, Card } from '../../../../shared/components/ui';
import { SectionHeader, ContentSection, LoadingState, EmptyState } from '../../../../shared/components/layout';
import TimelineEntry from './TimelineEntry';
import AddEntryForm from './AddEntryForm';
import { getProtocolDisplayText } from '../../../../shared/utils/entryHelpers';

const TimelineView = ({ 
  entries, 
  loading,
  showAddEntry,
  onToggleAddEntry,
  formData,
  updateFormData,
  toggleSelectedFood,
  handleQuickSelect,
  onSubmitEntry,
  onCancelEntry,
  preferences,
  protocols,
  exposureTypes,
  detoxTypes
}) => {
  return (
    <ContentSection spacing="comfortable">
      {/* Add Entry Section - Simplified */}
      <Card variant="feature" padding="default">
        <Button
          variant="primary"
          size="lg"
          onClick={onToggleAddEntry}
          icon={Plus}
          className="w-full"
        >
          Add Entry
        </Button>
      </Card>

      {/* Add Entry Form - No nested cards */}
      {showAddEntry && (
        <AddEntryForm
          formData={formData}
          updateFormData={updateFormData}
          toggleSelectedFood={toggleSelectedFood}
          handleQuickSelect={handleQuickSelect}
          onSubmit={onSubmitEntry}
          onCancel={onCancelEntry}
          preferences={preferences}
          exposureTypes={exposureTypes}
          detoxTypes={detoxTypes}
        />
      )}

      {/* Timeline Entries - Simplified structure */}
      <Card variant="section">
        <SectionHeader
          icon={Clock}
          title="Today's Timeline"
          subtitle={preferences.protocols.length > 0 ? getProtocolDisplayText(preferences.protocols, protocols) : undefined}
          variant="default"
        />
        
        <div className="p-4">
          {loading ? (
            <LoadingState message="Loading entries..." />
          ) : entries.length > 0 ? (
            <ContentSection spacing="default">
              {entries.map((entry) => (
                <TimelineEntry key={entry.id} entry={entry} />
              ))}
            </ContentSection>
          ) : (
            <EmptyState 
              icon={Clock}
              title="No entries yet today"
              message="Add your first entry to start tracking!"
            />
          )}
        </div>
      </Card>
    </ContentSection>
  );
};

export default TimelineView;