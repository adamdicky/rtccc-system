import { CollectionConfig } from 'payload'

export const BuildingCodes: CollectionConfig = {
  slug: 'building-codes',
  admin: {
    useAsTitle: 'ruleName',
  },
  fields: [
    {
      name: 'ruleName',
      type: 'text',
      required: true,
    },
    {
      name: 'featureKey',
      type: 'select',
      options: [
        { label: 'Door Width', value: 'door_width' },
        { label: 'Room Area', value: 'room_area' },
        { label: 'Fixture Clearance', value: 'fixture_clearance' },
        { label: 'Ceiling Height', value: 'ceiling_height' },
        { label: 'Egress Obstruction', value: 'egress_obstruction' },
      ],
      required: true,
    },
    {
      name: 'thresholdValue',
      type: 'number',
      admin: {
        description: 'The numerical goal (e.g., 915 for doors, 2400 for ceilings)',
      },
    },
    {
      name: 'logicOperator',
      type: 'select',
      options: [
        { label: 'Greater Than or Equal (>=)', value: 'gte' },
        { label: 'Less Than or Equal (<=)', value: 'lte' },
        { label: 'Not Equal (!=)', value: 'neq' },
      ],
    },
  ],
}