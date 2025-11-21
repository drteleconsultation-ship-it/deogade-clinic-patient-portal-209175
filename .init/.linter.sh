#!/bin/bash
cd /home/kavia/workspace/code-generation/deogade-clinic-patient-portal-209175/dr_deogade_clinic_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

